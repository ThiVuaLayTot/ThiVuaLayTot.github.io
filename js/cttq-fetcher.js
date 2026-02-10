// ============================================
// API & CONSTANTS
// ============================================
const API = {
    CHESS_COM: 'https://api.chess.com/pub',
    MONTHS_GIST: 'https://gist.githubusercontent.com/M-DinhHoangViet/0ae047855007aacfc63886f9d60bc03d/raw',
    TOURNAMENTS_GIST: 'https://gist.githubusercontent.com/M-DinhHoangViet/9c53a11fca709a656076bf6de7c118b0/raw'
};

const CONFIG = {
    MAX_CONCURRENT_REQUESTS: 10,
    TOP_PLAYERS_COUNT: 6,
    DEFAULT_AVATAR: 'https://chess.com/bundles/web/images/user-image.007dad08.svg'
};

const SELECTORS = {
    monthsContainer: '#cttq-months-container',
    tbody: (monthId) => `#cttq-tbody-${monthId}`,
    cards: (monthId) => `#cttq-cards-${monthId}`,
    stats: (monthId) => `#cttq-stats-${monthId}`
};

// ============================================
// RATE LIMITING & CACHING
// ============================================
class RequestManager {
    constructor(maxConcurrent = CONFIG.MAX_CONCURRENT_REQUESTS) {
        this.maxConcurrent = maxConcurrent;
        this.activeRequests = 0;
        this.cache = new Map();
    }

    async execute(fn) {
        while (this.activeRequests >= this.maxConcurrent) {
            await new Promise(r => setTimeout(r, 50));
        }
        this.activeRequests++;
        try {
            return await fn();
        } finally {
            this.activeRequests--;
        }
    }

    async fetchJSON(url) {
        if (this.cache.has(url)) return this.cache.get(url);
        
        const data = await this.execute(async () => {
            try {
                const response = await fetch(url);
                return response.ok ? await response.json() : null;
            } catch (error) {
                console.error(`Error fetching JSON: ${url}`, error);
                return null;
            }
        });
        
        if (data) this.cache.set(url, data);
        return data;
    }

    async fetchText(url) {
        return this.execute(async () => {
            try {
                const response = await fetch(url);
                return response.ok ? await response.text() : null;
            } catch (error) {
                console.error(`Error fetching text: ${url}`, error);
                return null;
            }
        });
    }
}

const requestManager = new RequestManager();

// ============================================
// DATA FETCHING
// ============================================
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

// ============================================
// DATA PROCESSING
// ============================================
class DataProcessor {
    static parsePlayer(playerData) {
        if (!playerData) {
            return { username: 'unknown', avatar: CONFIG.DEFAULT_AVATAR };
        }
        const p = playerData.player || playerData;
        return {
            username: p?.username || 'unknown',
            avatar: p?.avatar || CONFIG.DEFAULT_AVATAR,
            status: p?.status || 'N/A'
        };
    }

    static isCheater(playerData) {
        const p = playerData?.player || playerData;
        return p?.status && p.status.includes('closed');
    }

    static async getMonthlyAggregation(monthId) {
        const tourIds = await DataFetcher.getTournamentIds(monthId);
        
        if (tourIds.length === 0) {
            return { playerScores: {}, tournaments: [] };
        }

        // Fetch all tournament data in parallel
        const tourDataList = await Promise.all(
            tourIds.map(id => DataFetcher.getTournamentData(id))
        );
        
        const topPlayersDataList = await Promise.all(
            tourIds.map(id => DataFetcher.getTournamentRound(id))
        );

        const playerScores = {};
        const tournaments = [];

        // Process each tournament
        for (let i = 0; i < tourIds.length; i++) {
            const tournamentData = tourDataList[i];
            const roundData = topPlayersDataList[i];

            // Skip nếu không có tournament data
            if (!tournamentData) continue;

            // Xử lý players nếu có (giải đã có kết quả)
            const tourPlayers = (roundData?.players || [])
                .filter(p => p.username)
                .map(p => ({ username: p.username, points: p.points || 0 }));

            // Luôn thêm tournament vào danh sách (kể cả chưa hoàn thành)
            tournaments.push({
                id: tourIds[i],
                name: tournamentData.name || 'Unknown',
                url: tournamentData.url || `https://chess.com/tournament/${tourIds[i]}`,
                status: tournamentData.status || 'Unknown',
                topPlayers: tourPlayers
            });

            // Chỉ aggregate player scores nếu có players
            if (tourPlayers.length > 0) {
                tourPlayers.forEach(({ username, points }) => {
                    const key = username.toLowerCase();
                    if (!playerScores[key]) {
                        playerScores[key] = { username, totalPoints: 0 };
                    }
                    playerScores[key].totalPoints += points;
                });
            }
        }

        return { playerScores, tournaments };
    }

    static async getMonthlyTop(monthId, count = CONFIG.TOP_PLAYERS_COUNT) {
        const { playerScores, tournaments } = await this.getMonthlyAggregation(monthId);
        
        const sortedPlayers = Object.values(playerScores)
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .slice(0, count);

        // Fetch player details in parallel
        const playerDataList = await Promise.all(
            sortedPlayers.map(p => DataFetcher.getPlayerData(p.username))
        );

        // Identify cheaters
        const cheaters = sortedPlayers
            .map((player, idx) => ({ player, data: playerDataList[idx] }))
            .filter(({ data }) => this.isCheater(data))
            .map(({ player, data }) => ({
                username: player.username,
                avatar: this.parsePlayer(data).avatar
            }));

        return {
            topPlayers: sortedPlayers,
            playerDetails: playerDataList,
            tournaments,
            cheaters,
            totalPlayers: Object.keys(playerScores).length
        };
    }
}

// ============================================
// RENDERING
// ============================================
class Renderer {
    static getPlayerTournaments(username, tournaments) {
        const usernameLower = username.toLowerCase();
        return tournaments.flatMap(tournament =>
            tournament.topPlayers
                .filter(p => p.username.toLowerCase() === usernameLower)
                .map(p => ({
                    name: tournament.name,
                    url: tournament.url,
                    points: p.points
                }))
        );
    }

    static createPlayerRow(player, playerData, tournaments, cheaterSet, index) {
        const parsed = DataProcessor.parsePlayer(playerData);
        const isCheater = cheaterSet.has(player.username.toLowerCase());
        const cheaterIcon = isCheater ? ' <i class="fa fa-exclamation" style="color: #f87171;" title="Tài khoản bị khóa"></i>' : '';
        
        const playerTournaments = this.getPlayerTournaments(player.username, tournaments);
        const tournamentLinksHTML = playerTournaments.length > 0
            ? playerTournaments.map(t => `<a href="${t.url}" target="_blank" class="cttq-tournament-link">${t.name} (${t.points} điểm)</a>`).join('')
            : '<span style="color: var(--primary-warning);">Dữ liệu bị lỗi</span>';

        return `
            <tr>
                <td class="cttq-rank-cell">Top ${index + 1}</td>
                <td style="padding: 16px 24px;">
                    <div class="cttq-player-row">
                        <img class="cttq-avatar" src="${parsed.avatar}" alt="${parsed.username}" height="40" width="40" 
                             onerror="this.src='${CONFIG.DEFAULT_AVATAR}'">
                        <div class="cttq-player-details">
                            <div class="cttq-player-name">
                                <a href="//chess.com/member/${parsed.username}" target="_blank">
                                    <span>${parsed.username}</span>${cheaterIcon}
                                </a>
                            </div>
                            <div class="cttq-tournaments">${tournamentLinksHTML}</div>
                        </div>
                    </div>
                </td>
                <td class="cttq-points-cell">${player.totalPoints}</td>
            </tr>
        `;
    }

    static createCardRow(player, playerData, tournaments, cheaterSet, index) {
        const parsed = DataProcessor.parsePlayer(playerData);
        const isCheater = cheaterSet.has(player.username.toLowerCase());
        const cheaterIcon = isCheater ? ' <i class="fa fa-warning" style="color: #f87171;" title="Tài khoản bị khóa"></i>' : '';
        
        const playerTournaments = this.getPlayerTournaments(player.username, tournaments);
        const tournamentLinksHTML = playerTournaments.length > 0
            ? playerTournaments.map(t => `<a href="${t.url}" target="_blank" class="cttq-tournament-link">${t.name} (${t.points})</a>`).join('')
            : '<span style="color: #64748b; font-size: 11px;">Không có dữ liệu</span>';

        return `
            <div class="cttq-card">
                <div class="cttq-card-header">
                    <div class="cttq-card-rank">Top ${index + 1}</div>
                    <div style="flex: 1; display: flex; gap: 10px; align-items: flex-start; min-width: 0;">
                        <img class="cttq-avatar" src="${parsed.avatar}" alt="${parsed.username}" 
                             onerror="this.src='${CONFIG.DEFAULT_AVATAR}'" style="flex-shrink: 0; margin-top: 2px;">
                        <div class="cttq-card-info" style="min-width: 0;">
                            <div class="cttq-card-name">
                                <a href="//chess.com/member/${parsed.username}" target="_blank" 
                                   style="color: #60a5fa; text-decoration: none; word-break: break-word;">
                                    ${parsed.username}${cheaterIcon}
                                </a>
                            </div>
                            <div class="cttq-card-points">${player.totalPoints} điểm</div>
                        </div>
                    </div>
                </div>
                <div class="cttq-card-tournaments">
                    <button class="cttq-toggle-btn" 
                            onclick="const list = this.nextElementSibling; list.classList.toggle('show'); 
                                     this.innerHTML = list.classList.contains('show') ? '▼ Ẩn' : '▶ Xem (' + ${playerTournaments.length} + ')';">
                        <i class="fa fa-chevron-right"></i> Xem (${playerTournaments.length})
                    </button>
                    <div class="cttq-tournament-list">
                        ${tournamentLinksHTML}
                    </div>
                </div>
            </div>
        `;
    }

    static createTableSkeleton(count = 6) {
        return Array(count).fill(null).map(() => `
            <tr class="cttq-skeleton cttq-skeleton-row">
                <td><div class="cttq-skeleton cttq-skeleton-rank"></div></td>
                <td><div style="display: flex; gap: 16px;">
                    <div class="cttq-skeleton cttq-skeleton-avatar"></div>
                    <div style="flex: 1;">
                        <div class="cttq-skeleton cttq-skeleton-name"></div>
                        <div class="cttq-skeleton cttq-skeleton-tournaments"></div>
                    </div>
                </div></td>
                <td><div class="cttq-skeleton cttq-skeleton-points"></div></td>
            </tr>
        `).join('');
    }

    static renderTableLayout(topPlayers, playerDetails, tournaments, cheaters) {
        const cheaterSet = new Set(cheaters.map(c => c.username.toLowerCase()));
        
        if (topPlayers.length === 0) {
            // Nếu có giải nhưng chưa hoàn thành
            if (tournaments.length > 0) {
                const incompleteTours = tournaments.filter(t => t.topPlayers.length === 0);
                return `<tr><td colspan="3" style="text-align: center; padding: 20px; color: #f59e0b;">
                    <div><i class="fa fa-stopwatch"></i> ${incompleteTours.length} giải đang diễn ra, chưa có kết quả</div>
                    <div style="font-size: 12px; margin-top: 8px; color: #999;">
                        ${incompleteTours.map(t => `<a href="${t.url}" target="_blank" style="color: #60a5fa;">${t.name}</a>`).join(`<br>`)}
                    </div>
                </td></tr>`;
            }
            return '<tr><td colspan="3" style="text-align: center; padding: 20px; color: #999;">Không có dữ liệu top</td></tr>';
        }

        return topPlayers.map((player, i) =>
            this.createPlayerRow(player, playerDetails[i], tournaments, cheaterSet, i)
        ).join('');
    }

    static renderCardLayout(topPlayers, playerDetails, tournaments, cheaters) {
        const cheaterSet = new Set(cheaters.map(c => c.username.toLowerCase()));
                
        return topPlayers.map((player, i) =>
            this.createCardRow(player, playerDetails[i], tournaments, cheaterSet, i)
        ).join('');
    }
}

// ============================================
// PAGE MANAGER
// ============================================
class PageManager {
    static async renderMonth(monthId) {
        const container = document.querySelector(SELECTORS.monthsContainer);
        
        const section = document.createElement('div');
        section.className = 'cttq-month-section';
        section.id = `cttq-month-${monthId}`;
        
        section.innerHTML = `
            <div class="cttq-month-header">
                <span><i class="fa fa-calendar"></i> Tháng ${monthId}</span>
                <span id="${SELECTORS.stats(monthId).slice(1)}" style="font-size: 12px; color: #cbd5e1;">Đang tải...</span>
            </div>
            <table class="cttq-table">
                <thead>
                    <tr>
                        <th class="cttq-col-rank">THỨ HẠNG</th>
                        <th class="cttq-col-player">KỲ THỦ</th>
                        <th class="cttq-col-points">TỔNG ĐIỂM</th>
                    </tr>
                </thead>
                <tbody id="${SELECTORS.tbody(monthId).slice(1)}">
                    ${Renderer.createTableSkeleton()}
                </tbody>
            </table>
            <div id="${SELECTORS.cards(monthId).slice(1)}" style="padding: 0 12px;"></div>
        `;

        container.appendChild(section);

        try {
            const { topPlayers, playerDetails, tournaments, cheaters, totalPlayers } 
                = await DataProcessor.getMonthlyTop(monthId);

            // Update stats
            document.querySelector(SELECTORS.stats(monthId)).innerHTML = 
                `<i class="fa fa-users"></i> ${totalPlayers} người | <i class="fa fa-trophy"></i> ${tournaments.length} giải`;

            // Render table
            const tableHtml = Renderer.renderTableLayout(topPlayers, playerDetails, tournaments, cheaters);
            document.querySelector(SELECTORS.tbody(monthId)).innerHTML = tableHtml;

            // Render cards
            const cardsHtml = Renderer.renderCardLayout(topPlayers, playerDetails, tournaments, cheaters);
            document.querySelector(SELECTORS.cards(monthId)).innerHTML = cardsHtml;

        } catch (error) {
            console.error(`Error rendering month ${monthId}:`, error);
            document.querySelector(SELECTORS.tbody(monthId)).innerHTML = 
                '<tr><td colspan="3" style="text-align: center; padding: 20px; color: #f87171;">Lỗi tải dữ liệu</td></tr>';
        }
    }

    static async init() {
        try {
            const months = await DataFetcher.getMonths();
            
            if (months.length === 0) {
                document.querySelector(SELECTORS.monthsContainer).innerHTML = 
                    '<div style="text-align: center; padding: 20px; color: #f87171;">Không tìm thấy dữ liệu tháng</div>';
                return;
            }

            for (const month of months) {
                await this.renderMonth(month);
            }
        } catch (error) {
            console.error('Error initializing page:', error);
            document.querySelector(SELECTORS.monthsContainer).innerHTML = 
                '<div style="text-align: center; padding: 20px; color: #f87171;">Lỗi tải dữ liệu tháng</div>';
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================
window.addEventListener('DOMContentLoaded', () => {
    PageManager.init();
});