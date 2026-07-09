/**
 * @file CTTQ Tournament Fetcher
 * @description Fetches and aggregates CTTQ (Chiến Trường Thí Quân) tournament data into a unified table.
 */

/** @type {Object} API endpoint configurations */
const API = {
    CHESS_COM: 'https://api.chess.com/pub',
    MONTHS_GIST: 'https://gist.githubusercontent.com/M-DinhHoangViet/0ae047855007aacfc63886f9d60bc03d/raw',
    TOURNAMENTS_GIST: 'https://gist.githubusercontent.com/M-DinhHoangViet/9c53a11fca709a656076bf6de7c118b0/raw'
};

/** @type {Object} General configuration constants */
const CONFIG = {
    MAX_CONCURRENT_REQUESTS: 10,
    TOP_PLAYERS_COUNT: 6,
    DEFAULT_AVATAR: 'https://chess.com/bundles/web/images/user-image.007dad08.svg',
    CACHE_PREFIX: 'cttq_cache_',
    CACHE_TTL: {
        player: 7 * 24 * 60 * 60 * 1000,     // 1 week
        tournament: 24 * 60 * 60 * 1000,    // 1 day
        aggregation: 12 * 60 * 60 * 1000    // 12 hours
    }
};

/** @type {Object} Chess variant metadata and icons */
const VARIANTS = {
    'chess960': {
        name: 'Chess960',
        url: '/terms/chess960',
        icon: '/bundles/web/images/variants/live_960_orange.svg'
    },
    'kingofthehill': {
        name: 'KOTH',
        url: '/terms/king-of-the-hill',
        icon: '/bundles/web/images/variants/koth.svg'
    },
    'crazyhouse': {
        name: 'Crazyhouse',
        url: '/terms/crazyhouse-chess',
        icon: '/bundles/web/images/variants/crazyhouse.svg'
    },
    'bughouse': {
        name: 'Bughouse',
        url: '/terms/bughouse-chess',
        icon: '/bundles/web/images/variants/bughouse.svg'
    },
    'threecheck': {
        name: '3 Chiếu',
        url: '/terms/3-check-chess',
        icon: '/bundles/web/images/variants/3check.svg'
    },
    'custom': {
        name: 'Custom',
        url: '/terms/chess-variants',
        icon: '/bundles/web/images/variants/custom.svg'
    }
};

/** @type {Object} Time class icon mapping */
const TIME_CLASS_ICONS = {
    'lightning': { name: 'Bullet', path: '/bundles/web/images/icons/smileys/2x/bullet.png' },
    'bullet': { name: 'Bullet', path: '/bundles/web/images/icons/smileys/2x/bullet.png' },
    'blitz': { name: 'Blitz', path: '/bundles/web/images/icons/smileys/2x/blitz.png' },
    'rapid': { name: 'Rapid', path: '/bundles/web/images/icons/smileys/2x/live.png' },
    'standard': { name: 'Rapid', path: '/bundles/web/images/icons/smileys/2x/live.png' }
};

/**
 * @class PersistentCacheManager
 * @description Manages LocalStorage persistence.
 */
class PersistentCacheManager {
    static set(key, value, ttl) {
        try {
            const expiry = Date.now() + ttl;
            localStorage.setItem(CONFIG.CACHE_PREFIX + key, JSON.stringify({ value, expiry }));
        } catch (e) {
            if (e.name === 'QuotaExceededError') this.clearOld();
        }
    }

    static get(key) {
        try {
            const data = localStorage.getItem(CONFIG.CACHE_PREFIX + key);
            if (!data) return null;
            const { value, expiry } = JSON.parse(data);
            if (Date.now() > expiry) {
                localStorage.removeItem(CONFIG.CACHE_PREFIX + key);
                return null;
            }
            return value;
        } catch (e) { return null; }
    }

    static clearOld() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CONFIG.CACHE_PREFIX)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
}

/**
 * @class RequestManager
 * @description Handles rate-limited requests and caching for API calls.
 */
class RequestManager {
    constructor(maxConcurrent = CONFIG.MAX_CONCURRENT_REQUESTS) {
        this.maxConcurrent = maxConcurrent;
        this.activeRequests = 0;
        this.queue = [];
        this.cache = new Map();
    }

    async acquire() {
        if (this.activeRequests >= this.maxConcurrent) {
            await new Promise(resolve => this.queue.push(resolve));
        }
        this.activeRequests++;
        // Small delay to staggered concurrent requests
        await new Promise(r => setTimeout(r, 50));
    }

    release() {
        this.activeRequests--;
        if (this.queue.length > 0) {
            const next = this.queue.shift();
            next();
        }
    }

    async fetchWithRetry(url, type = 'json', retries = 3, backoff = 1000) {
        try {
            const response = await fetch(url);

            if (response.status === 429 && retries > 0) {
                const retryAfter = response.headers.get('Retry-After');
                const jitter = Math.random() * 200;
                const delay = (retryAfter ? parseInt(retryAfter) * 1000 : backoff) + jitter;

                console.warn(`[429] Too Many Requests for ${url}. Retrying in ${Math.round(delay)}ms...`);
                await new Promise(r => setTimeout(r, delay));
                return this.fetchWithRetry(url, type, retries - 1, backoff * 2);
            }

            if (!response.ok) return null;
            return type === 'json' ? await response.json() : await response.text();
        } catch (error) {
            if (retries > 0) {
                const jitter = Math.random() * 200;
                const delay = backoff + jitter;
                await new Promise(r => setTimeout(r, delay));
                return this.fetchWithRetry(url, type, retries - 1, backoff * 2);
            }
            console.warn(`Error fetching ${type}: ${url}`, error);
            return null;
        }
    }

    async fetchJSON(url) {
        if (this.cache.has(url)) return this.cache.get(url);

        // Check persistent cache for API requests
        if (url.includes('api.chess.com')) {
            const persistent = PersistentCacheManager.get(url);
            if (persistent) {
                this.cache.set(url, persistent);
                return persistent;
            }
        }

        await this.acquire();
        try {
            const data = await this.fetchWithRetry(url, 'json');
            if (data) {
                this.cache.set(url, data);
                if (url.includes('api.chess.com')) {
                    const ttl = url.includes('/player/') ? CONFIG.CACHE_TTL.player : CONFIG.CACHE_TTL.tournament;
                    PersistentCacheManager.set(url, data, ttl);
                }
            }
            return data;
        } finally {
            this.release();
        }
    }

    async fetchText(url) {
        if (this.cache.has(url)) return this.cache.get(url);

        await this.acquire();
        try {
            const data = await this.fetchWithRetry(url, 'text');
            if (data) this.cache.set(url, data);
            return data;
        } finally {
            this.release();
        }
    }
}

const requestManager = new RequestManager();

/**
 * @class DataFetcher
 * @description Static methods for fetching raw data from Gist and Chess.com.
 */
class DataFetcher {
    static async getMonths() {
        const text = await requestManager.fetchText(`${API.MONTHS_GIST}/cttq.txt`);
        return text ? text.split('\n').filter(line => line.trim()) : [];
    }

    static async getTournamentIds(monthId) {
        const text = await requestManager.fetchText(`${API.TOURNAMENTS_GIST}/${monthId}.txt`);
        return text ? text.split('\n').filter(line => line.trim()) : [];
    }

    static async getPlayerData(username) {
        return requestManager.fetchJSON(`${API.CHESS_COM}/player/${username}`);
    }

    static async getTournamentData(tourId) {
        return requestManager.fetchJSON(`${API.CHESS_COM}/tournament/${tourId}`);
    }

    static async getTournamentRound(tourId, round = 1) {
        return requestManager.fetchJSON(`${API.CHESS_COM}/tournament/${tourId}/${round}`);
    }
}

/**
 * @class DataProcessor
 * @description Logic for parsing raw API data and aggregating monthly statistics.
 */
class DataProcessor {
    static parsePlayer(playerData) {
        if (!playerData) {
            return { username: 'unknown', avatar: CONFIG.DEFAULT_AVATAR, status: 'N/A' };
        }
        const p = playerData.player || playerData;
        return {
            username: p?.username || 'unknown',
            avatar: p?.avatar || CONFIG.DEFAULT_AVATAR,
            status: p?.status || 'N/A'
        };
    }

    static calculateDuration(startDate, endDate) {
        if (!startDate || !endDate) return 'N/A';
        const start = typeof startDate === 'string' ? new Date(startDate) : new Date(startDate * 1000);
        const end = typeof endDate === 'string' ? new Date(endDate) : new Date(endDate * 1000);
        if (isNaN(start) || isNaN(end) || end < start) return 'N/A';
        const diffMs = end - start;
        const units = [
            { name: 'ngày', ms: 86400000 },
            { name: 'tiếng', ms: 3600000 },
            { name: 'phút', ms: 60000 },
            { name: 'giây', ms: 1000 }
        ];
        for (const unit of units) {
            if (diffMs >= unit.ms) {
                const value = Math.floor(diffMs / unit.ms);
                const remainder = diffMs % unit.ms;
                if (remainder === 0 || unit.name === 'giây') return `${value} ${unit.name}`;
                if (unit.name === 'tiếng') {
                    const minutes = Math.floor(remainder / 60000);
                    return minutes > 0 ? `${value} tiếng ${minutes} phút` : `${value} tiếng`;
                }
            }
        }
        return 'N/A';
    }

    static parseTimeControl(tcRaw) {
        if (!tcRaw) return '3+0';
        if (typeof tcRaw === 'number') return tcRaw >= 60 ? `${Math.floor(tcRaw / 60)}+0` : `${tcRaw}+0`;
        if (typeof tcRaw === 'string') {
            const match = tcRaw.match(/^(\d+)\+(\d+)$/);
            if (match) {
                const baseNum = parseInt(match[1]);
                const incNum = parseInt(match[2]);
                return baseNum >= 60 ? `${Math.floor(baseNum / 60)}+${incNum}` : `${baseNum}+${incNum}`;
            }
            const num = parseInt(tcRaw);
            if (!isNaN(num)) return num >= 60 ? `${Math.floor(num / 60)}+0` : `${num}+0`;
        }
        return '3+0';
    }

    static async getMonthlyAggregation(monthId) {
        const cached = PersistentCacheManager.get(`agg_${monthId}`);
        if (cached) return cached;

        const tourIds = await DataFetcher.getTournamentIds(monthId);

        if (tourIds.length === 0) {
            return { playerScores: {}, tournaments: [] };
        }

        // Fetch all tournament base data
        const tourDataList = await Promise.all(
            tourIds.map(id => DataFetcher.getTournamentData(id))
        );

        // Fetch final round data and group data for points
        const tournamentPlayerPoints = await Promise.all(
            tourDataList.map(async (data, i) => {
                if (!data) return new Map();
                const tourId = tourIds[i];
                const rounds = data.settings?.total_rounds || data.rounds || data.total_rounds || 0;
                const pointsMap = new Map();

                if (rounds > 0) {
                    const roundData = await DataFetcher.getTournamentRound(tourId, rounds);
                    if (roundData) {
                        let players = [];
                        if (roundData.groups && roundData.groups.length > 0) {
                            const groupResults = await Promise.allSettled(
                                roundData.groups.map(url => requestManager.fetchJSON(url))
                            );
                            groupResults.forEach(res => {
                                if (res.status === 'fulfilled' && res.value?.players) {
                                    players.push(...res.value.players);
                                }
                            });
                        } else if (roundData.players) {
                            players = roundData.players;
                        }

                        players.forEach(p => {
                            if (p.username) pointsMap.set(p.username.toLowerCase(), p.points || 0);
                        });
                    }
                }
                return pointsMap;
            })
        );

        const playerScores = {};
        const tournaments = [];

        // Process each tournament
        for (let i = 0; i < tourIds.length; i++) {
            const tournamentData = tourDataList[i];
            const pointsMap = tournamentPlayerPoints[i];

            if (!tournamentData) continue;

            const tourPlayers = (tournamentData.players || [])
                .map(p => {
                    const username = typeof p === 'string' ? p : p.username;
                    return {
                        username,
                        points: typeof p === 'object' && p.points !== undefined
                            ? p.points
                            : (pointsMap.get(username.toLowerCase()) || 0)
                    };
                });

            const rounds = tournamentData.settings?.total_rounds || tournamentData.rounds || tournamentData.total_rounds || 0;
            const startTime = tournamentData.start_time || tournamentData.startTime;
            const endTime = tournamentData.finish_time || tournamentData.endTime;
            const duration = startTime && endTime ? this.calculateDuration(startTime, endTime) : 'N/A';
            const timeControl = this.parseTimeControl(tournamentData.settings?.time_control || tournamentData.time_control || tournamentData.timeControl);

            let variant = tournamentData.settings?.rules || tournamentData.rules || 'standard';
            if (variant === 'standard' && tournamentData.settings?.initial_setup) {
                variant = 'custom';
            }

            tournaments.push({
                id: tourIds[i],
                name: tournamentData.name || 'Unknown',
                url: tournamentData.url || `https://chess.com/tournament/${tourIds[i]}`,
                status: tournamentData.status || 'Unknown',
                variant,
                timeClass: tournamentData.settings?.time_class || tournamentData.time_class || 'classical',
                timeControl: timeControl,
                totalRounds: rounds,
                duration: duration,
                playersCount: tournamentData.settings?.registered_user_count || tournamentData.players_registered || tournamentData.players?.length || 0,
                topPlayers: tourPlayers
            });

            if (tourPlayers.length > 0) {
                tourPlayers.forEach(({ username, points }) => {
                    const key = username.toLowerCase();
                    if (!playerScores[key]) {
                        playerScores[key] = { username, totalPoints: 0, breakdown: [] };
                    }
                    playerScores[key].totalPoints += points;
                    playerScores[key].breakdown.push({
                        tourName: tournamentData.name || 'Unknown',
                        points: points,
                        url: tournamentData.url
                    });
                });
            }
        }

        const result = { playerScores, tournaments };
        PersistentCacheManager.set(`agg_${monthId}`, result, CONFIG.CACHE_TTL.aggregation);
        return result;
    }

    static async getMonthlyTop(monthId, count = CONFIG.TOP_PLAYERS_COUNT) {
        const { playerScores, tournaments } = await DataProcessor.getMonthlyAggregation(monthId);

        const sortedPlayers = Object.values(playerScores)
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .slice(0, count);

        // Fetch player details in parallel
        const playerDataList = await Promise.all(
            sortedPlayers.map(p => DataFetcher.getPlayerData(p.username))
        );

        return {
            topPlayers: sortedPlayers,
            playerDetails: playerDataList,
            tournaments,
            totalPlayers: Object.keys(playerScores).length
        };
    }
}

/**
 * @class Renderer
 * @description Generates HTML strings for the tournament table.
 */
class Renderer {
    static image(src, width = '15px', height = '15px') {
        return `<img src="${src}" width="${width}" height="${height}" alt="" style="display: inline-block; vertical-align: middle;">`;
    }

    static timeControlFormat(timeControl, timeClass) {
        const icon = TIME_CLASS_ICONS[timeClass];
        const iconPath = icon ? `//chess.com${icon.path}` : null;
        const className = icon?.name || 'Standard';
        return `${timeControl} ${className} ${iconPath ? this.image(iconPath) : ''}`;
    }

    static variantInfo(variantKey) {
        const variant = VARIANTS[variantKey.toLowerCase()];
        if (!variant) return null;
        return {
            name: variant.name,
            url: `//chess.com${variant.url}`,
            icon: `//chess.com${variant.icon}`
        };
    }

    static async generatePlayerCell(player, playerData) {
        if (!player) {
            return '<td style="color: var(--primary-warning)">Chưa có dữ liệu!</td>';
        }

        const parsed = DataProcessor.parsePlayer(playerData);
        const avatarUrl = parsed.avatar && parsed.avatar !== 'N/A'
            ? parsed.avatar
            : CONFIG.DEFAULT_AVATAR;

        const badges = {
            'closed:abuse': { class: 'user-badges-closed', icon: 'bx bx-dislike', text: 'Closed: Abuse' },
            'closed:fair_play_violations': { class: 'user-badges-closed', icon: 'bx bx-block', text: 'Closed: Cheating' },
            'closed': { class: 'user-badges-inactive', icon: 'bx bx-no-signal', text: 'Closed: Inactive'},
            'premium': { class: 'user-badges-premium', icon: 'bx bxs-star', text: 'Chess.com Membership' }
        };

        const badgeData = badges[parsed.status];
        const badgeHTML = badgeData ? `
            <div class="user-badges-component">
                <div class="user-badges-badge ${badgeData.class}">
                    <span class="${badgeData.icon}"></span><span>${badgeData.text}</span>
                </div>
            </div>` : '';

        const playerJson = JSON.stringify(player).replace(/"/g, '&quot;');

        return `<td>
            <div class="post-user-component">
                <a class="cc-avatar-component post-user-avatar">
                    <img class="cc-avatar-img" src="${avatarUrl}" height="50" width="50" alt="${parsed.username}">
                </a>
                <div class="post-user-details">
                    <div class="user-tagline-component">
                        <a class="user-username-component user-tagline-username" href="//chess.com/member/${parsed.username}" target="_blank">${parsed.username}</a>
                    </div>
                    <div class="post-user-status">
                        <span>${badgeHTML}</span>
                        <span class="score-pill" data-player="${playerJson}">${player.totalPoints} ĐIỂM</span>
                    </div>
                </div>
            </div>
        </td>`;
    }

    static async generateMonthRow(monthId) {
        const { topPlayers, playerDetails, tournaments, totalPlayers } = await DataProcessor.getMonthlyTop(monthId);

        const tournamentsJson = JSON.stringify(tournaments).replace(/"/g, '&quot;');

        let html = '<tr>\n';
        html += `    <td class="name-tour month-clickable" data-tournaments="${tournamentsJson}" data-month="${monthId}" title="Xem chi tiết các vòng đấu">Tháng ${monthId} <i class="bx bx-info-circle" style="font-size: 0.8em; opacity: 0.7;"></i></td>\n`;
        html += `    <td class="organization-day">${tournaments.length} giải đấu</td>\n`;
        html += `    <td class="players">${totalPlayers}</td>\n`;

        for (let i = 0; i < CONFIG.TOP_PLAYERS_COUNT; i++) {
            const player = topPlayers[i] || null;
            const playerData = playerDetails[i] || null;
            html += `    ${await this.generatePlayerCell(player, playerData)}\n`;
        }

        html += '</tr>\n';
        return html;
    }

    static skeletonRow() {
        return Array(9).fill(null).map((_, i) =>
            i < 3
                ? '<td><div class="skeleton skeleton-text" style="width: 75%;"></div></td>'
                : '<td><div class="skeleton skeleton-avatar"></div></td>'
        ).join('\n    ');
    }
}

/**
 * @class ModalManager
 * @description Static methods for handling the score detail modal.
 */
class ModalManager {
    static showMonthDetails(monthId, tournaments) {
        const modal = document.getElementById('scoreModal');
        const title = document.getElementById('modal-player-name');
        const body = document.getElementById('modal-score-breakdown');

        if (!modal || !title || !body) return;

        title.textContent = `Chi tiết các vòng đấu: Tháng ${monthId}`;

        let html = `
            <div class="calendar-wrapper">
                <table class="styled-table score-detail-table">
                    <thead>
                        <tr>
                            <th>Vòng đấu</th>
                            <th>Thể lệ</th>
                            <th style="text-align: center;">Kỳ thủ</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        tournaments.forEach(t => {
            const variant = Renderer.variantInfo(t.variant);
            const variantHTML = variant ? ` <a href="${variant.url}" target="_blank">${variant.name} ${Renderer.image(variant.icon)}</a>` : '';
            const timeHTML = Renderer.timeControlFormat(t.timeControl, t.timeClass);
            const formatText = t.totalRounds === 1
                ? `Đấu trường Arena ${t.duration}`
                : `Hệ Thụy Sĩ ${t.totalRounds} vòng`;

            html += `
                <tr>
                    <td><a href="${t.url}" target="_blank">${t.name}</a></td>
                    <td>${timeHTML}${variantHTML}<br>${formatText}</td>
                    <td style="text-align: center; font-weight: bold; color: var(--cyan-300);">${t.playersCount} <span class=""></span></td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        body.innerHTML = html;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    static show(player) {
        const modal = document.getElementById('scoreModal');
        const title = document.getElementById('modal-player-name');
        const body = document.getElementById('modal-score-breakdown');

        if (!modal || !title || !body) return;

        title.textContent = `Chi tiết điểm của ${player.username}`;

        let html = `
            <div class="calendar-wrapper">
                <table class="styled-table score-detail-table">
                    <thead>
                        <tr>
                            <th>Giải đấu</th>
                            <th style="text-align: center;">Điểm</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        player.breakdown.forEach(item => {
            html += `
                <tr>
                    <td><a href="${item.url}" target="_blank">${item.tourName}</a></td>
                    <td style="text-align: center; font-weight: bold; color: var(--cyan-300);">${item.points}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                    <tfoot>
                        <tr>
                            <td style="font-weight: bold; text-align: right;">TỔNG CỘNG:</td>
                            <td style="text-align: center; font-weight: bold; color: var(--yellow-400);">${player.totalPoints}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;

        body.innerHTML = html;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    static close() {
        const modal = document.getElementById('scoreModal');
        if (modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }
    }
}

/**
 * @class PageManager
 * @description Orchestrates the rendering of the table on the page.
 */
class PageManager {
    static showScoreDetail(player) {
        ModalManager.show(player);
    }

    static initModal() {
        const modal = document.getElementById('scoreModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) ModalManager.close();
            });
        }

        // Event delegation for score pills and month details
        const tbody = document.getElementById('tournament-tbody');
        if (tbody) {
            tbody.addEventListener('click', (e) => {
                const scorePill = e.target.closest('.score-pill');
                if (scorePill && scorePill.dataset.player) {
                    try {
                        const player = JSON.parse(scorePill.dataset.player);
                        ModalManager.show(player);
                    } catch (err) {
                        console.error('Error parsing player data:', err);
                    }
                    return;
                }

                const monthCell = e.target.closest('.month-clickable');
                if (monthCell && monthCell.dataset.tournaments) {
                    try {
                        const tournaments = JSON.parse(monthCell.dataset.tournaments);
                        const monthId = monthCell.dataset.month;
                        ModalManager.showMonthDetails(monthId, tournaments);
                    } catch (err) {
                        console.error('Error parsing tournaments data:', err);
                    }
                }
            });
        }
    }

    static async init() {
        const container = document.getElementById('cttq-months-container');
        if (!container) return;

        container.innerHTML = '<div class="loading">Đang xử lý dữ liệu...</div>';

        try {
            const months = await DataFetcher.getMonths();

            if (months.length === 0) {
                container.innerHTML = '<div class="error">Không tìm thấy dữ liệu giải đấu nào.</div>';
                return;
            }

            const initialHTML = `
                <input type="text" id="searchInput" class="search-bar" onkeyup="searchTable()" placeholder="Tìm kiếm trong bảng">
                <div id="loading-status" style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
                    Đang xử lý:&nbsp;&nbsp;<span id="statusIcon" class="bx bx-dots-horizontal-rounded" style="color: var(--primary-warning)"></span>&nbsp;<span><span id="current-tournament">0</span>/<span id="total-tournaments">${months.length}</span>&nbsp;tháng</span>
                </div>
                <div class="table">
                    <table class="styled-table" id="tournament-results-table">
                        <thead>
                        <tr>
                            <th class="name-tour">Tháng</th>
                            <th class="organization-day">Thống kê</th>
                            <th class="players">Kỳ thủ</th>
                            <th class="winner">🥇 Top 1</th>
                            <th class="winner">🥈 Top 2</th>
                            <th class="winner">🥉 Top 3</th>
                            <th class="winner">🎖️ Top 4</th>
                            <th class="winner">🏅 Top 5</th>
                            <th class="winner">⭐ Top 6</th>
                        </tr>
                        </thead>
                        <tbody id="tournament-tbody">
                        </tbody>
                    </table>
                </div>
            `;

            container.innerHTML = initialHTML;
            const tbody = document.getElementById('tournament-tbody');

            // Add skeleton rows
            const skeletonRows = months.map((_, i) => {
                const tr = document.createElement('tr');
                tr.innerHTML = Renderer.skeletonRow();
                tr.classList.add('skeleton-row');
                tbody.appendChild(tr);
                return tr;
            });

            let successCount = 0;

            // Fetch and render each month concurrently
            const monthPromises = months.map(async (monthId, index) => {
                try {
                    const rowHTML = await Renderer.generateMonthRow(monthId);
                    const skeletonRow = skeletonRows[index];

                    if (skeletonRow) {
                        const tempDiv = document.createElement('tbody');
                        tempDiv.innerHTML = rowHTML;
                        const newRow = tempDiv.firstElementChild;
                        skeletonRow.parentNode.replaceChild(newRow, skeletonRow);
                    }

                    successCount++;
                    document.getElementById('current-tournament').textContent = successCount;
                } catch (error) {
                    console.warn(`Error processing month ${monthId}:`, error);
                }
            });

            await Promise.allSettled(monthPromises);

            PageManager.initModal();

            const statusIcon = document.getElementById('statusIcon');
            if (successCount === months.length) {
                statusIcon.style.color = 'var(--primary-success)';
                statusIcon.className = 'bx bx-check';
            } else {
                statusIcon.style.color = 'var(--color-red)';
                statusIcon.className = 'bx bx-x';
            }

        } catch (error) {
            console.error('Error initializing page:', error);
            container.innerHTML = '<div class="error">Lỗi tải dữ liệu. Hãy thử làm mới trang!</div>';
        }
    }
}

// INITIALIZATION
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => PageManager.init());
} else {
    PageManager.init();
}