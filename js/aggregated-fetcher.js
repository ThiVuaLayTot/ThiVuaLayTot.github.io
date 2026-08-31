(function() {
    const API = {
        CHESS_COM: 'https://api.chess.com/pub',
        GIST: 'https://gist.githubusercontent.com/M-DinhHoangViet/9c53a11fca709a656076bf6de7c118b0/raw'
    };

    const CONFIG = {
        MAX_CONCURRENT: 10,
        TOP_PLAYERS: 6,
        CHESS_COM_URL: 'https://www.chess.com',
        DEFAULT_AVATAR: 'https://www.chess.com/bundles/web/images/user-image.007dad08.svg',
        CACHE_PREFIX: 'agg_cache_',
        CACHE_TTL: { p: 604800000, t: 86400000, a: 43200000 }
    };

    const VARIANTS = {
        'chess': { name: 'Cờ tiêu chuẩn', url: '/terms/chess', icon: '/bundles/web/images/icons/smileys/2x/board.png' },
        'standard': { name: 'Cờ tiêu chuẩn', url: '/terms/chess', icon: '/bundles/web/images/icons/smileys/2x/board.png' },
        'chess960': { name: 'Chess960', url: '/terms/chess960', icon: '/bundles/web/images/variants/live_960_orange.svg' },
        'kingofthehill': { name: 'KOTH', url: '/terms/king-of-the-hill', icon: '/bundles/web/images/variants/koth.svg' },
        'crazyhouse': { name: 'Crazyhouse', url: '/terms/crazyhouse-chess', icon: '/bundles/web/images/variants/crazyhouse.svg' },
        'bughouse': { name: 'Bughouse', url: '/terms/bughouse-chess', icon: '/bundles/web/images/variants/bughouse.svg' },
        'threecheck': { name: '3 Chiếu', url: '/terms/3-check-chess', icon: '/bundles/web/images/variants/3check.svg' },
        'custom': { name: 'Custom', url: '/terms/chess-variants', icon: '/bundles/web/images/icons/smileys/2x/themes.png' }
    };

    const TIME_ICONS = {
        'lightning': { name: 'Bullet', path: '/bundles/web/images/icons/smileys/2x/bullet.png' },
        'bullet': { name: 'Bullet', path: '/bundles/web/images/icons/smileys/2x/bullet.png' },
        'blitz': { name: 'Blitz', path: '/bundles/web/images/icons/smileys/2x/blitz.png' },
        'rapid': { name: 'Rapid', path: '/bundles/web/images/icons/smileys/2x/live.png' },
        'standard': { name: 'Rapid', path: '/bundles/web/images/icons/smileys/2x/live.png' }
    };

    const BADGE_CONFIG = {
        'closed:abuse': { c: 'user-badges-closed', i: 'bx bx-dislike', t: 'Bị khóa: Lạm dụng' },
        'closed:fair_play_violations': { c: 'user-badges-closed', i: 'bx bx-block', t: 'Bị khóa: Fair Play' },
        'closed': { c: 'user-badges-inactive', i: 'bx bx-no-signal', t: 'Bị khóa' },
        'premium': { c: 'user-badges-premium', i: 'bx bxs-star', t: 'Premium' }
    };

    // ========== Utility Functions ==========
    function formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp * 1000);
        if (isNaN(date)) return 'N/A';
        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${h}:${m}, ngày ${day}/${month}/${year}`;
    }

    function calculateDuration(startTs, endTs) {
        if (!startTs || !endTs) return 'N/A';
        const start = new Date(startTs * 1000);
        const end = new Date(endTs * 1000);
        if (isNaN(start) || isNaN(end) || end < start) return 'N/A';

        const diff = end - start;
        const units = [
            { n: 'ngày', m: 86400000 },
            { n: 'tiếng', m: 3600000 },
            { n: 'phút', m: 60000 },
            { n: 'giây', m: 1000 }
        ];

        for (const { n, m } of units) {
            if (diff >= m) {
                const val = Math.floor(diff / m);
                const rem = diff % m;
                if (n === 'tiếng' && rem >= 60000) {
                    return `${val} tiếng ${Math.floor(rem / 60000)} phút`;
                }
                return `${val} ${n}`;
            }
        }
        return 'N/A';
    }

    function parseTimeControl(tc) {
        if (!tc) return '3+0';
        const match = String(tc).match(/^(\d+)\+(\d+)$/);
        if (match) {
            const base = parseInt(match[1]);
            const increment = parseInt(match[2]);
            return base >= 60 ? `${Math.floor(base / 60)}+${increment}` : `${base}+${increment}`;
        }
        const num = parseInt(tc);
        return !isNaN(num) ? (num >= 60 ? `${Math.floor(num / 60)}+0` : `${num}+0`) : '3+0';
    }

    function createImg(src, w = 15) {
        return `<img src="${src}" width="${w}" height="${w}" alt="" style="display: inline-block; vertical-align: middle;">`;
    }

    // ========== Cache System ==========
    const Cache = {
        memory: new Map(),
        get(key) {
            if (this.memory.has(key)) return this.memory.get(key);
            try {
                const stored = localStorage.getItem(CONFIG.CACHE_PREFIX + key);
                if (stored) {
                    const { val, exp } = JSON.parse(stored);
                    if (Date.now() < exp) {
                        this.memory.set(key, val);
                        return val;
                    }
                    localStorage.removeItem(CONFIG.CACHE_PREFIX + key);
                }
            } catch (e) {}
            return null;
        },
        set(key, val, ttl) {
            this.memory.set(key, val);
            try {
                localStorage.setItem(CONFIG.CACHE_PREFIX + key, JSON.stringify({ val, exp: Date.now() + ttl }));
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    Object.keys(localStorage)
                        .filter(k => k.startsWith(CONFIG.CACHE_PREFIX))
                        .forEach(k => localStorage.removeItem(k));
                }
            }
        }
    };

    // ========== Request Manager ==========
    const RequestManager = {
        active: 0,
        queue: [],
        async acquire() {
            if (this.active >= CONFIG.MAX_CONCURRENT) {
                await new Promise(r => this.queue.push(r));
            }
            this.active++;
        },
        release() {
            this.active--;
            if (this.queue.length) this.queue.shift()();
        },
        async fetch(url, isJson = true) {
            const cached = Cache.get(url);
            if (cached) return cached;

            await this.acquire();
            try {
                for (let attempt = 0; attempt < 2; attempt++) {
                    try {
                        const response = await fetch(url);
                        if (response.status === 429) {
                            await new Promise(r => setTimeout(r, 2000));
                            continue;
                        }
                        if (!response.ok) return null;

                        const data = isJson ? await response.json() : await response.text();

                        if (url.startsWith(API.CHESS_COM)) {
                            const ttl = url.includes('/player/') ? CONFIG.CACHE_TTL.p : CONFIG.CACHE_TTL.t;
                            Cache.set(url, data, ttl);
                        } else {
                            Cache.memory.set(url, data);
                        }
                        return data;
                    } catch (e) {
                        if (attempt === 1) return null;
                        await new Promise(r => setTimeout(r, 1000));
                    }
                }
            } finally {
                this.release();
            }
        }
    };

    // ========== Data Processor ==========
    const DataProcessor = {
        toursByMonth: {},

        parseUnifiedFormat(text) {
            const lines = text ? text.split('\n').map(l => l.trim()) : [];
            const months = [];
            const toursByMonth = {};
            let currentMonth = null;

            for (const line of lines) {
                if (!line) continue;
                if (line.startsWith('*')) {
                    currentMonth = line.slice(1).trim();
                    if (currentMonth) {
                        months.push(currentMonth);
                        toursByMonth[currentMonth] = [];
                    }
                } else if (currentMonth) {
                    toursByMonth[currentMonth].push(line);
                }
            }
            return { months, toursByMonth };
        },

        getTournamentMetadata(data) {
            const rounds = data.settings?.total_rounds || data.rounds || data.total_rounds || 0;
            const variant = data.settings?.rules || data.rules || 'standard';
            const setup = data.settings?.initial_setup || null;
            const finalVariant = (variant === 'standard' || variant === 'chess') && setup ? 'custom' : variant;

            return {
                rounds,
                variant: finalVariant,
                setup,
                timeControl: parseTimeControl(data.settings?.time_control || data.time_control || data.timeControl),
                timeClass: data.settings?.time_class || data.time_class || 'classical',
                registeredCount: Math.max(
                    data.settings?.registered_user_count || 0,
                    data.players_registered || 0,
                    (data.players || []).length
                ),
                startTime: data.start_time || data.startTime || 0,
                endTime: data.finish_time || data.endTime || 0,
                isFinished: data.status === 'finished' || data.settings?.status === 'finished'
            };
        },

        buildPlayersMap(mainPlayers, pointsMap) {
            const playerMap = new Map();

            // Add round data players
            pointsMap.forEach((points, username) => {
                playerMap.set(username, { username: this.getOriginalUsername(username, mainPlayers), points });
            });

            // Add/update with main tournament players
            mainPlayers.forEach(player => {
                const username = typeof player === 'string' ? player : player.username;
                const usernameLower = username.toLowerCase();
                const points = player.points ?? pointsMap.get(usernameLower) ?? 0;

                if (playerMap.has(usernameLower)) {
                    const existing = playerMap.get(usernameLower);
                    existing.points = Math.max(existing.points, points);
                } else {
                    playerMap.set(usernameLower, { username, points });
                }
            });

            return Array.from(playerMap.values());
        },

        getOriginalUsername(usernameLower, mainPlayers) {
            for (const player of mainPlayers) {
                const username = typeof player === 'string' ? player : player.username;
                if (username.toLowerCase() === usernameLower) return username;
            }
            return usernameLower;
        },

        async getMonthlyAggregation(monthId, eventType) {
            const cacheKey = `agg_v3_${eventType}_${monthId}`;
            const cached = Cache.get(cacheKey);
            if (cached) return cached;

            let tournamentIds = [];
            if (this.toursByMonth?.[monthId]) {
                tournamentIds = this.toursByMonth[monthId];
            } else {
                const text = await RequestManager.fetch(`${API.GIST}/${monthId}.txt`, false);
                tournamentIds = text ? text.split('\n').filter(l => l.trim()) : [];
            }

            if (!tournamentIds.length) {
                return { playerScores: {}, tournaments: [], status: 'finished' };
            }

            // Fetch all tournaments
            const tourDataList = await Promise.all(
                tournamentIds.map(id => RequestManager.fetch(`${API.CHESS_COM}/tournament/${id}`))
            );

            const playerScores = {};
            const tournaments = [];
            let monthStatus = 'finished';

            for (let i = 0; i < tournamentIds.length; i++) {
                const data = tourDataList[i];
                if (!data) continue;

                const meta = this.getTournamentMetadata(data);
                if (!meta.isFinished) monthStatus = 'unfinished';

                // Fetch round data
                let pointsMap = new Map();
                if (meta.rounds > 0) {
                    const roundData = await RequestManager.fetch(
                        `${API.CHESS_COM}/tournament/${tournamentIds[i]}/${meta.rounds}`
                    );
                    const groups = roundData?.groups || [];
                    const playerList = groups.length
                        ? (await Promise.allSettled(groups.map(url => RequestManager.fetch(url))))
                            .filter(r => r.status === 'fulfilled')
                            .flatMap(r => r.value?.players || [])
                        : (roundData?.players || []);

                    playerList.forEach(p => {
                        if (p.username) {
                            pointsMap.set(p.username.toLowerCase(), p.points || 0);
                        }
                    });
                }

                // Build tournament data
                const tourPlayers = this.buildPlayersMap(data.players || [], pointsMap);

                tournaments.push({
                    id: tournamentIds[i],
                    name: data.name || 'Unknown',
                    url: data.url || `${CONFIG.CHESS_COM_URL}/tournament/${tournamentIds[i]}`,
                    variant: meta.variant,
                    setup: meta.setup,
                    timeClass: meta.timeClass,
                    timeControl: meta.timeControl,
                    totalRounds: meta.rounds,
                    duration: calculateDuration(meta.startTime, meta.endTime),
                    playersCount: meta.registeredCount,
                    startTime: meta.startTime
                });

                // Aggregate player scores
                tourPlayers.forEach(player => {
                    const usernameLower = player.username.toLowerCase();
                    if (!playerScores[usernameLower]) {
                        playerScores[usernameLower] = {
                            username: player.username,
                            totalPoints: 0,
                            breakdown: []
                        };
                    }
                    playerScores[usernameLower].totalPoints += player.points;
                    playerScores[usernameLower].breakdown.push({
                        tourName: data.name || 'Unknown',
                        points: player.points,
                        url: data.url
                    });
                });
            }

            const result = { playerScores, tournaments, status: monthStatus };
            Cache.set(cacheKey, result, CONFIG.CACHE_TTL.a);
            return result;
        }
    };

    // ========== Renderer ==========
    const Renderer = {
        timeFormat(tc, timeClass) {
            const icon = TIME_ICONS[timeClass];
            const iconHtml = icon ? createImg(`${CONFIG.CHESS_COM_URL}${icon.path}`) : '';
            return `${tc} ${icon?.name || 'Standard'}${iconHtml}`;
        },

        variantInfo(variant) {
            const data = VARIANTS[variant.toLowerCase()];
            return data ? {
                name: data.name,
                url: `${CONFIG.CHESS_COM_URL}${data.url}`,
                icon: `${CONFIG.CHESS_COM_URL}${data.icon}`
            } : null;
        },

        formatBadge(status) {
            const badge = BADGE_CONFIG[status];
            if (!badge) return '';
            return `<div class="user-badges-component"><div class="user-badges-badge ${badge.c}"><span class="${badge.i}"></span><span>${badge.t}</span></div></div>`;
        },

        async playerCell(player, playerData) {
            if (!player) {
                return '<td style="color: var(--primary-warning)">Chưa có dữ liệu!</td>';
            }

            const data = playerData?.player || playerData || {
                username: player.username,
                avatar: CONFIG.DEFAULT_AVATAR,
                status: 'N/A'
            };

            const badgeHtml = this.formatBadge(data.status);

            return `<td class="player-cell clickable-player" data-player='${JSON.stringify(player).replace(/'/g, "&apos;")}' data-avatar='${(data.avatar || CONFIG.DEFAULT_AVATAR).replace(/'/g, "&apos;")}' data-status='${data.status || "N/A"}' style="cursor: pointer;">
                <div class="post-user-component">
                    <a class="cc-avatar-component post-user-avatar" href="${CONFIG.CHESS_COM_URL}/member/${data.username}" target="_blank">
                        <img class="cc-avatar-img" src="${data.avatar || CONFIG.DEFAULT_AVATAR}" height="50" width="50" alt="${data.username}">
                    </a>
                    <div class="post-user-details">
                        <div class="user-tagline-component">
                            <a class="user-username-component user-tagline-username" href="${CONFIG.CHESS_COM_URL}/member/${data.username}" target="_blank">${data.username}</a>
                        </div>
                        <div class="post-user-status">
                            <span>${badgeHtml}</span>
                            <span class="score-display" style="font-weight: bold;">${player.totalPoints} ĐIỂM</span>
                        </div>
                    </div>
                </div>
            </td>`;
        },

        async monthRow(monthId, eventType) {
            const { playerScores, tournaments } = await DataProcessor.getMonthlyAggregation(monthId, eventType);
            const topPlayers = Object.values(playerScores)
                .sort((a, b) => b.totalPoints - a.totalPoints)
                .slice(0, CONFIG.TOP_PLAYERS);

            const playerDetails = await Promise.all(
                topPlayers.map(p => RequestManager.fetch(`${API.CHESS_COM}/player/${p.username}`))
            );

            const tournamentsJson = JSON.stringify(tournaments).replace(/'/g, "&apos;");
            let html = `<tr>
                <td class="name-tour month-clickable" data-tournaments='${tournamentsJson}' data-month="${monthId}">
                    Tháng ${monthId} <i class="bx bx-info-circle" style="font-size: 0.8em; opacity: 0.7;"></i>
                </td>
                <td class="organization-day month-clickable" data-tournaments='${tournamentsJson}' data-month="${monthId}">
                    ${tournaments.length} giải đấu <i class="bx bx-info-circle" style="font-size: 0.8em; opacity: 0.7;"></i>
                </td>
                <td class="players">${Object.keys(playerScores).length}</td>`;

            for (let i = 0; i < CONFIG.TOP_PLAYERS; i++) {
                html += await this.playerCell(topPlayers[i], playerDetails[i]);
            }

            return html + '</tr>';
        }
    };

    // ========== Modal Manager ==========
    const ModalManager = {
        show(title, content) {
            const modal = document.getElementById('scoreModal');
            if (modal) {
                document.getElementById('modal-player-name').textContent = title;
                document.getElementById('modal-score-breakdown').innerHTML = content;
                modal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        },
        close() {
            const modal = document.getElementById('scoreModal');
            if (modal) {
                modal.classList.remove('open');
                document.body.style.overflow = '';
            }
        }
    };

    // ========== Event Handler Builder ==========
    const EventHandlers = {
        handlePlayerClick(playerData, avatar, status) {
            const badgeHtml = Renderer.formatBadge(status);
            let html = `<div class="calendar-wrapper">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="${avatar || CONFIG.DEFAULT_AVATAR}" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px; border: 2px solid var(--cyan-300);" alt="${playerData.username}">
                    <h3 style="margin: 10px 0 5px 0;"><a href="${CONFIG.CHESS_COM_URL}/member/${playerData.username}" target="_blank">${playerData.username}</a></h3>
                    ${badgeHtml ? `<div style="margin-top: 5px;">${badgeHtml}</div>` : ''}
                </div>

                <table class="styled-table score-detail-table" style="width: 100%;">
                    <thead><tr><th>Giải đấu</th><th style="text-align: center;">Điểm</th></tr></thead>
                    <tbody>`;

            playerData.breakdown.forEach(item => {
                html += `<tr><td><a href="${item.url}" target="_blank" style="color: var(--cyan-300); text-decoration: none;">${item.tourName}</a></td><td style="text-align: center; color: var(--yellow-400); font-weight: bold;">${item.points}</td></tr>`;
            });

            html += `</tbody>
                <tfoot><tr style="border-top: 2px solid var(--cyan-300);"><td style="text-align: right; font-weight: bold;">TỔNG CỘNG:</td><td style="text-align: center; color: var(--yellow-400); font-weight: bold; font-size: 1.1em;">${playerData.totalPoints}</td></tr></tfoot>
                </table></div>`;

            ModalManager.show(`${playerData.username}`, html);
        },

        handleMonthClick(monthElement, tournaments) {
            let html = `<div class="calendar-wrapper">
                <table class="styled-table score-detail-table">
                    <thead><tr><th>Vòng đấu</th><th>Thời gian bắt đầu</th><th>Thể lệ</th><th style="text-align: center;">Kỳ thủ</th></tr></thead>
                    <tbody>`;

            tournaments.forEach(tour => {
                const variantInfo = Renderer.variantInfo(tour.variant);
                let variantHtml = '';
                if (variantInfo) {
                    if (tour.setup) {
                        variantHtml = ` <a href="javascript:void(0)" class="custom-variant-link" data-setup="${tour.setup}">${variantInfo.name}${createImg(variantInfo.icon)}</a>`;
                    } else {
                        variantHtml = ` <a href="${variantInfo.url}" target="_blank">${variantInfo.name} ${createImg(variantInfo.icon)}</a>`;
                    }
                }

                const formatStr = tour.totalRounds === 1
                    ? `Đấu trường Arena ${tour.duration}`
                    : `Hệ Thụy Sĩ ${tour.totalRounds} vòng`;

                const startTimeStr = formatDate(tour.startTime);
                html += `<tr><td><a href="${tour.url}" target="_blank">${tour.name}</a></td><td>${startTimeStr}</td><td>${Renderer.timeFormat(tour.timeControl, tour.timeClass)}<br>${variantHtml}<br>${formatStr}</td><td style="text-align: center;">${tour.playersCount}</td></tr>`;
            });

            html += '</tbody></table></div>';
            ModalManager.show(`Chi tiết tháng ${monthElement.dataset.month}`, html);
        },

        handleCustomVariantClick(setup) {
            ModalManager.show('Thế cờ ban đầu', `<div class="calendar-wrapper" style="padding: 20px; color: var(--neutral-100); word-break: break-all;">${setup}</div>`);
        }
    };

    // ========== Page Manager ==========
    const PageManager = {
        async init() {
            const container = document.querySelector('[data-fetch-aggregated]');
            if (!container) return;

            const eventType = container.dataset.fetchAggregated || 'cttq';
            container.innerHTML = '<div class="loading">Đang xử lý dữ liệu...</div>';

            let text = await RequestManager.fetch(`${API.GIST}/${eventType}.txt`, false);
            if (!text) {
                text = await RequestManager.fetch(`${API.GIST}/${eventType}`, false);
            }

            let months = [];
            if (text?.includes('*')) {
                const parsed = DataProcessor.parseUnifiedFormat(text);
                months = parsed.months;
                DataProcessor.toursByMonth = parsed.toursByMonth;
            } else if (text) {
                months = text.split('\n').map(l => l.trim()).filter(l => l);
            }

            if (!months.length) {
                container.innerHTML = '<div class="error">Không tìm thấy dữ liệu.</div>';
                return;
            }

            container.innerHTML = `
                <div class="filter-group-container" style="margin-bottom: 25px;">
                    <div class="tour-top-grid">
                        <div class="tour-select-container" style="grid-column: span 2;">
                            <select id="sortFilter" class="tour-select-btn" onchange="searchTable()">
                                <option value="date-desc">Tháng tổ chức (Mới nhất)</option>
                                <option value="date-asc">Tháng tổ chức (Cũ nhất)</option>
                                <option value="players-desc">Số lượng kỳ thủ (Nhiều nhất)</option>
                                <option value="players-asc">Số lượng kỳ thủ (Ít nhất)</option>
                                <option value="tours-desc">Số lượng giải đấu (Nhiều nhất)</option>
                                <option value="tours-asc">Số lượng giải đấu (Ít nhất)</option>
                            </select>
                        </div>
                        <div class="tour-select-container" style="grid-column: span 2;">
                            <select id="cttq-status-filter" class="tour-select-btn" onchange="searchTable()">
                                <option value="all">Tất cả trạng thái</option>
                                <option value="finished">Đã hoàn thành</option>
                                <option value="unfinished">Chưa hoàn thành</option>
                            </select>
                        </div>
                    </div>
                    <div class="tour-search-row">
                        <div class="tour-search-wrapper">
                            <span class="bx bx-search tour-search-icon"></span>
                            <input type="text" id="searchInput" class="tour-search-input" placeholder="Tìm kiếm..." onkeyup="searchTable()">
                        </div>
                        <label class="tour-switch-container">
                            <span class="tour-switch">
                                <input type="checkbox" id="premiumToggle" checked onchange="searchTable()">
                                <span class="tour-slider"></span>
                            </span>
                            <span>Hiện Premium Badge</span>
                        </label>
                        <div id="loading-status" class="loading-status-badge">
                            <span id="statusIcon" class="bx bx-dots-horizontal-rounded" style="color: var(--primary-warning)"></span>
                            <span id="current-tournament">0</span>/${months.length} tháng
                        </div>
                    </div>
                </div>
                <div class="table">
                    <table class="styled-table" id="tournament-results-table">
                        <thead><tr><th class="name-tour">Tháng</th><th class="organization-day">Thống kê</th><th class="players">Kỳ thủ</th>
                        <th class="winner">🥇 Top 1</th><th class="winner">🥈 Top 2</th><th class="winner">🥉 Top 3</th><th class="winner">🎖️ Top 4</th><th class="winner">🏅 Top 5</th><th class="winner">⭐ Top 6</th></tr></thead>
                        <tbody id="tournament-tbody"><tr class="not-match" style="display: none"><td style="color: var(--color-warning)">Không tìm thấy kết quả nào!</td></tr></tbody>
                    </table>
                </div>`;

            if (typeof window.loadTournamentFiltersFromURL === 'function') {
                window.loadTournamentFiltersFromURL();
            }

            this.setupEventHandlers();
            this.loadMonthsData(months);
        },

        setupEventHandlers() {
            const modal = document.getElementById('scoreModal');
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target.id === 'scoreModal') {
                        ModalManager.close();
                    }
                    const customLink = e.target.closest('.custom-variant-link');
                    if (customLink) {
                        EventHandlers.handleCustomVariantClick(customLink.dataset.setup);
                    }
                });
            }

            const tbody = document.getElementById('tournament-tbody');
            tbody.addEventListener('click', (e) => {
                // NEW: Click on player cell with avatar
                const playerCell = e.target.closest('.clickable-player');
                if (playerCell) {
                    const playerData = JSON.parse(playerCell.dataset.player);
                    const avatar = playerCell.dataset.avatar;
                    const status = playerCell.dataset.status;
                    EventHandlers.handlePlayerClick(playerData, avatar, status);
                    return;
                }

                // Month click
                const monthElement = e.target.closest('.month-clickable');
                if (monthElement) {
                    const tournaments = JSON.parse(monthElement.dataset.tournaments);
                    EventHandlers.handleMonthClick(monthElement, tournaments);
                }
            });
        },

        async loadMonthsData(months) {
            const tbody = document.getElementById('tournament-tbody');
            const skeletonRows = this.createSkeletonRows(months.length);
            skeletonRows.forEach(row => tbody.appendChild(row));

            let successCount = 0;
            const eventType = document.querySelector('[data-fetch-aggregated]').dataset.fetchAggregated || 'cttq';

            await Promise.allSettled(months.map(async (monthId, idx) => {
                try {
                    const html = await Renderer.monthRow(monthId, eventType);
                    const tempContainer = document.createElement('tbody');
                    tempContainer.innerHTML = html;
                    const newRow = tempContainer.firstElementChild;

                    const { playerScores, tournaments, status } = await DataProcessor.getMonthlyAggregation(monthId, eventType);

                    // Parse month for timestamp
                    const [monthNum, year] = monthId.split('-').map(Number);
                    const timestamp = new Date(year, monthNum - 1, 1).getTime();

                    newRow.setAttribute('data-start-time', timestamp);
                    newRow.setAttribute('data-players-count', Object.keys(playerScores).length);
                    newRow.setAttribute('data-tours-count', tournaments.length);
                    newRow.setAttribute('data-status', status || 'finished');

                    skeletonRows[idx].replaceWith(newRow);
                    document.getElementById('current-tournament').textContent = ++successCount;

                    if (typeof window.searchTable === 'function') {
                        window.searchTable();
                    }
                } catch (e) {
                    console.error('Error loading month:', monthId, e);
                }
            }));

            this.updateStatus(successCount, months.length);
        },

        createSkeletonRows(count) {
            return Array.from({ length: count }, () => {
                const tr = document.createElement('tr');
                tr.className = 'skeleton-row';
                let html = `
                    <td><div class="skeleton skeleton-text" style="width: 80%;"></div></td>
                    <td><div class="skeleton skeleton-text" style="width: 60%;"></div></td>
                    <td><div class="skeleton skeleton-text" style="width: 30px; margin: auto;"></div></td>`;

                html += Array.from({ length: CONFIG.TOP_PLAYERS }, () => `
                    <td>
                        <div class="post-user-component">
                            <div class="skeleton skeleton-avatar"></div>
                            <div class="post-user-details">
                                <div class="skeleton skeleton-text" style="width: 70px;"></div>
                                <div class="skeleton skeleton-text" style="width: 40px;"></div>
                            </div>
                        </div>
                    </td>`
                ).join('');

                tr.innerHTML = html;
                return tr;
            });
        },

        updateStatus(successCount, totalCount) {
            const statusIcon = document.getElementById('statusIcon');
            const isComplete = successCount === totalCount;
            statusIcon.style.color = isComplete ? 'var(--primary-success)' : 'var(--color-danger)';
            statusIcon.className = isComplete ? 'bx bx-check' : 'bx bx-x';
        }
    };

    // ========== Initialization ==========
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', () => PageManager.init());
    } else {
        PageManager.init();
    }

    window.TournamentModalManager = ModalManager;
})();
