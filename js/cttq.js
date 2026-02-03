
const CHESS_COM_BASE = 'https://api.chess.com/pub';
const GIST_MONTHS = 'https://gist.githubusercontent.com/M-DinhHoangViet/0ae047855007aacfc63886f9d60bc03d/raw';
const GIST_TOURNAMENTS = 'https://gist.githubusercontent.com/M-DinhHoangViet/9c53a11fca709a656076bf6de7c118b0/raw';
let MONTHS = [];
const playerCache = new Map();
let activeRequests = 0;
const MAX_CONCURRENT = 10;
async function withRateLimit(fn) {
    while (activeRequests >= MAX_CONCURRENT) {
        await new Promise(r => setTimeout(r, 50));
    }
    activeRequests++;
    try {
        return await fn();
    } finally {
        activeRequests--;
    }
}
async function fetchJSON(url) {
    return withRateLimit(async () => {
        try {
            const response = await fetch(url);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            return null;
        }
    });
}
async function fetchText(url) {
    return withRateLimit(async () => {
        try {
            const response = await fetch(url);
            if (!response.ok) return null;
            return await response.text();
        } catch (error) {
            return null;
        }
    });
}
async function getCTTQMonths() {
    const text = await fetchText(`${GIST_MONTHS}/cttq.txt`);
    return text ? text.split('\n').filter(line => line.trim()) : [];
}
async function getCTTQTournamentIds(monthId) {
    const text = await fetchText(`${GIST_TOURNAMENTS}/${monthId}.txt`);
    return text ? text.split('\n').filter(line => line.trim()) : [];
}
async function fetchPlayerData(username) {
    if (playerCache.has(username)) {
        return playerCache.get(username);
    }
    const data = await fetchJSON(`${CHESS_COM_BASE}/player/${username}`);
    playerCache.set(username, data);
    return data;
}
function parsePlayerData(playerData) {
    if (!playerData) {
        return { 
            username: 'unknown', 
            avatar: 'https://chess.com/bundles/web/images/user-image.007dad08.svg' 
        };
    }
    const p = playerData.player || playerData;
    return {
        username: p?.username || 'unknown',
        avatar: p?.avatar || 'https://chess.com/bundles/web/images/user-image.007dad08.svg',
        status: p?.status || 'N/A'
    };
}
async function getTournamentTopPlayers(tourId) {
    const roundData = await fetchJSON(`${CHESS_COM_BASE}/tournament/${tourId}/1`);
    if (!roundData?.players) return { players: [], points: [] };
    const players = [];
    const points = [];
    for (const p of roundData.players) {
        if (p.username) {
            players.push(p.username);
            points.push(p.points || 0);
        }
    }
    return { players, points };
}
async function aggregateMonthlyScores(monthId) {
    const tourIds = await getCTTQTournamentIds(monthId);
    if (tourIds.length === 0) return { playerScores: {}, tournaments: [] };
    const playerScores = {};
    const tournaments = [];
    const tourDataPromises = tourIds.map(id => fetchJSON(`${CHESS_COM_BASE}/tournament/${id}`));
    const tourDataList = await Promise.all(tourDataPromises);
    const topPlayersPromises = tourIds.map(id => getTournamentTopPlayers(id));
    const topPlayersList = await Promise.all(topPlayersPromises);
    for (let i = 0; i < tourIds.length; i++) {
        const tournamentData = tourDataList[i];
        const { players, points } = topPlayersList[i];
        if (players.length > 0 && tournamentData) {
            tournaments.push({
                id: tourIds[i],
                name: tournamentData.name || 'Unknown',
                url: tournamentData.url || `https://chess.com/tournament/${tourIds[i]}`,
                topPlayers: players.map((p, j) => ({
                    username: p,
                    points: points[j]
                }))
            });
            for (let j = 0; j < players.length; j++) {
                const username = players[j].toLowerCase();
                if (!playerScores[username]) {
                    playerScores[username] = {
                        username: players[j],
                        totalPoints: 0
                    };
                }
                playerScores[username].totalPoints += points[j];
            }
        }
    }
    return { playerScores, tournaments };
}
async function getMonthlyTop6(monthId) {
    const { playerScores, tournaments } = await aggregateMonthlyScores(monthId);
    const sortedPlayers = Object.values(playerScores)
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 6);
    const top6DataPromises = sortedPlayers.map(p => fetchPlayerData(p.username));
    const top6DataList = await Promise.all(top6DataPromises);
    const cheaters = [];
    const cheatersSet = new Set();
    for (let i = 0; i < sortedPlayers.length; i++) {
        const playerData = top6DataList[i];
        if (playerData) {
            const p = playerData.player || playerData;
            if (p?.status && p.status.includes('closed')) {
                const key = sortedPlayers[i].username.toLowerCase();
                if (!cheatersSet.has(key)) {
                    cheatersSet.add(key);
                    cheaters.push({
                        username: sortedPlayers[i].username,
                        avatar: p.avatar || 'https://www.chess.com/bundles/web/images/user-image.007dad08.svg'
                    });
                }
            }
        }
    }
    return { 
        topPlayers: sortedPlayers, 
        tournaments,
        totalPlayers: Object.keys(playerScores).length,
        cheaters: cheaters,
        top6Data: top6DataList
    };
}
function getPlayerTournamentsInMonth(username, tournaments) {
    const usernameLower = username.toLowerCase();
    const playerTournaments = [];
    for (const tournament of tournaments) {
        for (const topPlayer of tournament.topPlayers || []) {
            if (topPlayer.username.toLowerCase() === usernameLower) {
                playerTournaments.push({
                    name: tournament.name,
                    url: tournament.url,
                    points: topPlayer.points
                });
                break;
            }
        }
    }
    return playerTournaments;
}
function renderCardsLayout(monthId, topPlayers, tournaments, cheaters, top6Data) {
    const html = topPlayers.map((player, i) => {
        const parsed = parsePlayerData(top6Data[i]);
        const cheaterUsernames = new Set(cheaters.map(c => c.username.toLowerCase()));
        const isCheater = cheaterUsernames.has(player.username.toLowerCase());
        const cheaterIcon = isCheater ? ' <i class="fa fa-warning" style="color: #f87171;" title="Tài khoản bị khóa"></i>' : '';
        const playerTournaments = getPlayerTournamentsInMonth(player.username, tournaments);
        const tournamentLinksHTML = playerTournaments.length > 0
            ? playerTournaments.map(t => `<a href="${t.url}" target="_blank" class="cttq-tournament-link">${t.name} (${t.points})</a>`).join('')
            : '<span style="color: #64748b; font-size: 11px;">Không có dữ liệu</span>';
        return `
            <div class="cttq-card">
                <div class="cttq-card-header">
                    <div class="cttq-card-rank">Top ${i + 1}</div>
                    <div style="flex: 1; display: flex; gap: 10px; align-items: flex-start; min-width: 0;">
                        <img class="cttq-avatar" src="${parsed.avatar}" alt="${parsed.username}" onerror="this.src='https://www.chess.com/bundles/web/images/user-image.007dad08.svg'" style="flex-shrink: 0; margin-top: 2px;">
                        <div class="cttq-card-info" style="min-width: 0;">
                            <div class="cttq-card-name">
                                <a href="//chess.com/member/${parsed.username}" target="_blank" style="color: #60a5fa; text-decoration: none; word-break: break-word;">${parsed.username}${cheaterIcon}</a>
                            </div>
                            <div class="cttq-card-points">${player.totalPoints} điểm</div>
                        </div>
                    </div>
                </div>
                <div class="cttq-card-tournaments">
                    <button class="cttq-toggle-btn" onclick="const list = this.nextElementSibling; list.classList.toggle('show'); this.innerHTML = list.classList.contains('show') ? '<i class=\"fa fa-chevron-down\"></i> Ẩn' : '<i class=\"fa fa-chevron-right\"></i> Xem (' + ${playerTournaments.length} + ')';">
                        <i class="fa fa-chevron-right"></i> Xem (${playerTournaments.length})
                    </button>
                    <div class="cttq-tournament-list">
                        ${tournamentLinksHTML}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    return html;
}
function createSkeleton() {
    return `
        <tr class="cttq-skeleton cttq-skeleton-row">
            <td><div class="cttq-skeleton cttq-skeleton-rank"></div></td>
            <td><div style="display: flex; gap: 16px;"><div class="cttq-skeleton cttq-skeleton-avatar"></div><div style="flex: 1;"><div class="cttq-skeleton cttq-skeleton-name"></div><div class="cttq-skeleton cttq-skeleton-tournaments"></div></div></div></td>
            <td><div class="cttq-skeleton cttq-skeleton-points"></div></td>
        </tr>
    `;
}
async function renderMonthTable(monthId) {
    const container = document.getElementById('cttq-months-container');
    const section = document.createElement('div');
    section.className = 'cttq-month-section';
    section.id = `cttq-month-${monthId}`;
    section.innerHTML = `
        <div class="cttq-month-header">
            <span><i class="fa fa-calendar"></i> Tháng ${monthId}</span>
            <span id="cttq-stats-${monthId}" style="font-size: 12px; color: #cbd5e1;">Đang tải...</span>
        </div>
        <table class="cttq-table">
            <thead><tr><th class="cttq-col-rank">THỨ HẠNG</th><th class="cttq-col-player">KỲ THỦ</th><th class="cttq-col-points">TỔNG ĐIỂM</th></tr></thead>
            <tbody id="cttq-tbody-${monthId}">${createSkeleton().repeat(6)}</tbody>
        </table>
        <div id="cttq-cards-${monthId}" style="padding: 0 12px;"></div>
    `;    
    container.appendChild(section);
    try {
        const { topPlayers, tournaments, totalPlayers, cheaters, top6Data } = await getMonthlyTop6(monthId);
        document.getElementById(`cttq-stats-${monthId}`).innerHTML = `<i class="fa fa-users"></i> ${totalPlayers} người | <i class="fa fa-trophy"></i> ${tournaments.length} giải`;
        // Render table layout
        const cheaterUsernames = new Set(cheaters.map(c => c.username.toLowerCase()));
        let tableHtml = '';
        if (topPlayers.length === 0) {
            tableHtml = '<tr><td colspan="3" style="text-align: center; padding: 20px; color: #999;">Không có dữ liệu</td></tr>';
        } else {
            for (let i = 0; i < topPlayers.length; i++) {
                const player = topPlayers[i];
                const parsed = parsePlayerData(top6Data[i]);
                const isCheater = cheaterUsernames.has(player.username.toLowerCase());
                const cheaterIcon = isCheater ? ' <i class="fa fa-warning" style="color: #f87171;" title="Tài khoản bị khóa"></i>' : '';
                const playerTournaments = getPlayerTournamentsInMonth(player.username, tournaments);
                const tournamentLinksHTML = playerTournaments.length > 0
                    ? playerTournaments.map(t => `<a href="${t.url}" target="_blank" class="cttq-tournament-link">${t.name} (${t.points} điểm)</a>`).join('')
                    : '<span style="color: #64748b;">Không có dữ liệu</span>';
                tableHtml += `<tr>
                    <td class="cttq-rank-cell">Top ${i + 1}</td>
                    <td style="padding: 16px 24px;">
                        <div class="cttq-player-row">
                            <img class="cttq-avatar" src="${parsed.avatar}" alt="${parsed.username}" height="40" width="40" onerror="this.src='https://www.chess.com/bundles/web/images/user-image.007dad08.svg'">
                            <div class="cttq-player-details">
                                <div class="cttq-player-name"><a href="//chess.com/member/${parsed.username}" target="_blank"><span>${parsed.username}</span>${cheaterIcon}</a></div>
                                <div class="cttq-tournaments">${tournamentLinksHTML}</div>
                            </div>
                        </div>
                    </td>
                    <td class="cttq-points-cell">${player.totalPoints}</td>
                </tr>`;
            }
        }    
        document.getElementById(`cttq-tbody-${monthId}`).innerHTML = tableHtml;
        // Render card layout
        const cardsHtml = renderCardsLayout(monthId, topPlayers, tournaments, cheaters, top6Data);
        document.getElementById(`cttq-cards-${monthId}`).innerHTML = cardsHtml;
    } catch (error) {
        document.getElementById(`cttq-tbody-${monthId}`).innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px; color: #f87171;">Lỗi tải dữ liệu</td></tr>';
    }
}
async function initPage() {
    MONTHS = await getCTTQMonths();
    if (MONTHS.length === 0) {
        document.getElementById('cttq-months-container').innerHTML = 
            '<div style="text-align: center; padding: 20px; color: #f87171;">Không tìm thấy dữ liệu tháng</div>';
        return;
    }
    for (const month of MONTHS) {
        await renderMonthTable(month);
    }
}
window.addEventListener('DOMContentLoaded', () => {
    initPage();
});