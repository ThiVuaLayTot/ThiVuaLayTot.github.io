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
    DEFAULT_AVATAR: 'https://chess.com/bundles/web/images/user-image.007dad08.svg'
};

/**
 * @class RequestManager
 * @description Handles rate-limited requests and caching for API calls.
 */
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
                console.warn(`Error fetching JSON: ${url}`, error);
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
                console.warn(`Error fetching text: ${url}`, error);
                return null;
            }
        });
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

    static async getMonthlyAggregation(monthId) {
        const tourIds = await DataFetcher.getTournamentIds(monthId);

        if (tourIds.length === 0) {
            return { playerScores: {}, tournaments: [] };
        }

        // Fetch all tournament base data
        const tourDataList = await Promise.all(
            tourIds.map(id => DataFetcher.getTournamentData(id))
        );

        // Fetch final round data for each tournament
        const topPlayersDataList = await Promise.all(
            tourDataList.map((data, i) => {
                const rounds = data?.settings?.total_rounds || data?.rounds || data?.total_rounds || 1;
                return DataFetcher.getTournamentRound(tourIds[i], rounds);
            })
        );

        const playerScores = {};
        const tournaments = [];

        // Process each tournament
        for (let i = 0; i < tourIds.length; i++) {
            const tournamentData = tourDataList[i];
            const roundData = topPlayersDataList[i];

            if (!tournamentData) continue;

            const tourPlayers = (roundData?.players || [])
                .filter(p => p.username)
                .map(p => ({ username: p.username, points: p.points || 0 }));

            tournaments.push({
                id: tourIds[i],
                name: tournamentData.name || 'Unknown',
                url: tournamentData.url || `https://chess.com/tournament/${tourIds[i]}`,
                status: tournamentData.status || 'Unknown',
                topPlayers: tourPlayers
            });

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
                        <span>${player.totalPoints} ĐIỂM</span>
                    </div>
                </div>
            </div>
        </td>`;
    }

    static async generateMonthRow(monthId) {
        const { topPlayers, playerDetails, tournaments, totalPlayers } = await DataProcessor.getMonthlyTop(monthId);

        let html = '<tr>\n';
        html += `    <td class="name-tour">Tháng ${monthId}</td>\n`;
        html += `    <td class="organization-day">${tournaments.length} giải đấu</td>\n`;
        html += `    <td class="rules">Chiến Trường Thí Quân</td>\n`;
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
        return Array(10).fill(null).map((_, i) =>
            i < 4
                ? '<td><div class="skeleton skeleton-text" style="width: 75%;"></div></td>'
                : '<td><div class="skeleton skeleton-avatar"></div></td>'
        ).join('\n    ');
    }
}

/**
 * @class PageManager
 * @description Orchestrates the rendering of the table on the page.
 */
class PageManager {
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
                    Đang hiển thị:&nbsp;&nbsp;<span id="statusIcon" class="bx bx-dots-horizontal-rounded" style="color: var(--primary-warning)"></span>&nbsp;<span><span id="current-tournament">0</span>/<span id="total-tournaments">${months.length}</span>&nbsp;tháng giải đấu</span>
                </div>
                <div class="table">
                    <table class="styled-table" id="tournament-results-table">
                        <thead>
                        <tr>
                            <th class="name-tour">Tháng</th>
                            <th class="organization-day">Thống kê</th>
                            <th class="rules">Thể lệ</th>
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
window.addEventListener('DOMContentLoaded', () => {
    PageManager.init();
});
