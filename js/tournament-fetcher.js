/**
 * Tournament Data Fetcher
 * Automatically fetches tournament data from Chess.com API and renders table
 */

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const CONFIG = {
    CHESS_COM_BASE: 'https://api.chess.com/pub',
    CHESS_COM_URL: '//chess.com',
    GIST_BASE: 'https://gist.githubusercontent.com/M-DinhHoangViet/9c53a11fca709a656076bf6de7c118b0/raw',
    MAX_PLAYERS_DISPLAY: 6,
    BATCH_SIZE: Infinity
};

const SPECIAL_PLAYERS = new Map([
    ['m_dinhhoangviet', { name: 'M-DinhHoangViet', special: true }],
    ['tungjohn_playing_chess', { name: 'M-DinhHoangViet', special: true }],
    ['thangthukquantrong', { name: 'thangthukquantrong', special: true }]
]);

// Variant icons configuration - consolidated
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
    }
};

const TIME_CLASS_ICONS = {
    'bullet': { name: 'Bullet', path: '/bundles/web/images/icons/smileys/2x/bullet.png' },
    'blitz': { name: 'Blitz', path: '/bundles/web/images/icons/smileys/2x/blitz.png' },
    'rapid': { name: 'Rapid', path: '/bundles/web/images/icons/smileys/2x/live.png' },
    'standard': { name: 'Rapid', path: '/bundles/web/images/icons/smileys/2x/live.png' }
};

// Pre-compile regex
const TIME_CONTROL_REGEX = /^(\d+)\+(\d+)$/;

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

const Cache = {
    players: new Map(),
    tournaments: new Map(),
    
    getPlayer(username) {
        return this.players.get(username);
    },
    
    setPlayer(username, data) {
        this.players.set(username, data);
    },
    
    hasPlayer(username) {
        return this.players.has(username);
    },
    
    getTournament(id) {
        return this.tournaments.get(id);
    },
    
    setTournament(id, data) {
        this.tournaments.set(id, data);
    },
    
    clear() {
        this.players.clear();
        this.tournaments.clear();
    }
};

// ============================================================================
// URL BUILDERS - Centralized URL generation
// ============================================================================

const URLs = {
    chessDotCom(path) {
        return `${CONFIG.CHESS_COM_URL}${path}`;
    },
    
    tournament(tourId) {
        return `${CONFIG.CHESS_COM_BASE}/tournament/${tourId}`;
    },
    
    round(tourId, roundNum) {
        return `${CONFIG.CHESS_COM_BASE}/tournament/${tourId}/${roundNum}`;
    },
    
    player(username) {
        return `${CONFIG.CHESS_COM_BASE}/player/${username}`;
    },
    
    member(username) {
        return this.chessDotCom(`/member/${username}`);
    },
    
    gistFile(eventType) {
        return `${CONFIG.GIST_BASE}/${eventType}.txt`;
    },
    
    variantInfo(variantKey) {
        const variant = VARIANTS[variantKey.toLowerCase()];
        return variant ? this.chessDotCom(variant.url) : null;
    },
    
    variantIcon(variantKey) {
        const variant = VARIANTS[variantKey.toLowerCase()];
        return variant ? this.chessDotCom(variant.icon) : null;
    },
    
    timeIcon(timeClass) {
        const icon = TIME_CLASS_ICONS[timeClass];
        return icon ? this.chessDotCom(icon.path) : null;
    }
};

// ============================================================================
// HTML BUILDERS - Centralized HTML generation
// ============================================================================

const HTML = {
    image(src, width = '15px', height = '15px') {
        return `<img src="${src}" width="${width}" height="${height}" alt="">`;
    },
    
    variantLink(variantKey) {
        const variant = VARIANTS[variantKey.toLowerCase()];
        if (!variant) return '<br>';
        
        const url = URLs.variantInfo(variantKey);
        const icon = URLs.variantIcon(variantKey);
        return ` <a href="${url}" target="_blank">${variant.name} ${this.image(icon)}</a><br>`;
    },
    
    timeControlFormat(timeControl, timeClass) {
        const icon = TIME_CLASS_ICONS[timeClass];
        const iconPath = URLs.timeIcon(timeClass);
        const className = icon?.name || 'Standard';
        
        return `${timeControl} ${className} ${iconPath ? this.image(iconPath) : ''}`;
    },
    
    userBadge(status) {
        const badges = {
            'closed:abuse': { class: 'user-badges-closed', icon: 'bx bx-dislike', text: 'Closed: Abuse' },
            'closed:fair_play_violations': { class: 'user-badges-closed', icon: 'bx bx-block', text: 'Closed: Cheating' },
            'closed': { class: 'user-badges-inactive', icon: 'bx bx-no-signal', text: 'Closed: Inactive'},
            'premium': { class: 'user-badges-premium', icon: 'bx bxs-star', text: 'Chess.com Membership' }
        };
        
        const badge = badges[status];
        if (!badge) return '';
        
        return `<div class="user-badges-component">
            <div class="user-badges-badge ${badge.class}">
                <span class="${badge.icon}"></span><span>${badge.text}</span>
            </div>
        </div>`;
    },
    
    skeletonRow() {
        const cells = Array(10).fill(null).map((_, i) => 
            i < 4 
                ? '<td><div class="skeleton skeleton-text" style="width: 75%;"></div></td>'
                : '<td><div class="skeleton skeleton-avatar"></div></td>'
        ).join('\n    ');
        
        return cells;
    }
};

// ============================================================================
// DATA FETCHING
// ============================================================================

/**
 * Generic fetch with error handling
 */
async function fetchJSON(url, errorContext) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`[${errorContext}] Status: ${response.status} for ${url}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`[${errorContext}] Error:`, error);
        return null;
    }
}

/**
 * Fetch tournament IDs from gist
 */
async function getIds(eventType) {
    try {
        const url = URLs.gistFile(eventType);
        const response = await fetch(url);
        const text = await response.text();
        return text.split('\n').filter(line => line.trim());
    } catch (error) {
        console.error(`[getIds] Error fetching ${eventType}:`, error);
        return [];
    }
}

/**
 * Fetch tournament data with caching
 */
async function fetchTournamentData(tourId) {
    if (Cache.getTournament(tourId)) {
        return Cache.getTournament(tourId);
    }
    
    const data = await fetchJSON(URLs.tournament(tourId), 'fetchTournamentData');
    if (data) Cache.setTournament(tourId, data);
    return data;
}

/**
 * Fetch round data
 */
async function fetchRoundData(tourId, roundNum) {
    return fetchJSON(URLs.round(tourId, roundNum), `fetchRoundData:${tourId}:${roundNum}`);
}

/**
 * Fetch player data with caching
 */
async function fetchPlayerData(username) {
    if (Cache.hasPlayer(username)) {
        return Cache.getPlayer(username);
    }
    
    const data = await fetchJSON(URLs.player(username), `fetchPlayerData:${username}`);
    if (data) Cache.setPlayer(username, data);
    return data;
}

/**
 * Batch fetch players (optimized)
 */
async function fetchPlayerDataBatch(usernames) {
    const unique = [...new Set(usernames)];
    const missing = unique.filter(u => !Cache.hasPlayer(u));
    
    if (missing.length === 0) return;
    
    const promises = missing.map(u => fetchPlayerData(u).catch(() => null));
    await Promise.allSettled(promises);
}

// ============================================================================
// DATA PARSING & PROCESSING
// ============================================================================

/**
 * Calculate tournament duration
 */
function calculateDuration(startDate, endDate) {
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
            
            if (remainder === 0 || unit.name === 'giây') {
                return `${value} ${unit.name}`;
            }
            
            // For hours, show remaining minutes
            if (unit.name === 'tiếng') {
                const minutes = Math.floor(remainder / 60000);
                return minutes > 0 ? `${value} tiếng ${minutes} phút` : `${value} tiếng`;
            }
        }
    }
    
    return 'N/A';
}

/**
 * Format date
 */
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    
    const date = typeof timestamp === 'string' 
        ? new Date(timestamp)
        : new Date(parseInt(timestamp) * 1000);
    
    if (isNaN(date)) return 'N/A';
    
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    
    return `${h}h${m}, ngày ${d}/${mo}/${y}`;
}

/**
 * Parse time control
 */
function parseTimeControl(tcRaw) {
    if (!tcRaw) return '3+0';
    
    if (typeof tcRaw === 'number') {
        return tcRaw >= 60 ? `${Math.floor(tcRaw / 60)}+0` : `${tcRaw}+0`;
    }
    
    if (typeof tcRaw === 'string') {
        const match = tcRaw.match(TIME_CONTROL_REGEX);
        if (match) {
            const baseNum = parseInt(match[1]);
            const incNum = parseInt(match[2]);
            return baseNum >= 60 ? `${Math.floor(baseNum / 60)}+${incNum}` : `${baseNum}+${incNum}`;
        }
        
        const num = parseInt(tcRaw);
        if (!isNaN(num)) {
            return num >= 60 ? `${Math.floor(num / 60)}+0` : `${num}+0`;
        }
    }
    
    return '3+0';
}

/**
 * Get player points from round data
 */
function getPlayerPoints(username, roundData) {
    if (!roundData?.players) return 0;
    
    const player = roundData.players.find(p => 
        p.username && p.username.toLowerCase() === username.toLowerCase()
    );
    
    return player?.points || 0;
}

/**
 * Sort and extract top players with points
 */
function getTopPlayers(playersOrder, roundData, maxCount = 6) {
    if (!playersOrder || playersOrder.length === 0) {
        return { players: [], points: [] };
    }
    
    const players = playersOrder.slice(0, maxCount);
    const points = players.map(username => getPlayerPoints(username, roundData));
    
    return { players, points };
}

/**
 * Parse player data
 */
function parsePlayerData(playerData) {
    if (!playerData) {
        return { username: 'unknown', status: 'N/A', avatar: 'N/A' };
    }
    
    const p = playerData.player || playerData;
    
    return {
        username: p?.username || 'unknown',
        status: p?.status || 'N/A',
        avatar: p?.avatar || 'N/A'
    };
}

/**
 * Parse tournament data
 */
async function parseTournamentData(data, tourId) {
    if (!data) {
        console.error(`[parseTournamentData] No data for tournament ${tourId}`);
        return null;
    }
    
    const tournament = data.tournament || data;
    
    if (!tournament || typeof tournament !== 'object') {
        console.error(`[parseTournamentData] Invalid tournament data for ${tourId}`);
        return null;
    }
    
    const rounds = tournament.settings?.total_rounds || tournament.rounds || tournament.total_rounds || 0;
    
    let roundInfo = null;
    if (rounds > 0) {
        roundInfo = await fetchRoundData(tourId, rounds);
    }
    
    const playersOrder = (tournament.players || [])
        .map(p => (typeof p === 'object' && p.username) ? p.username : p)
        .filter(Boolean);
    
    const { players, points } = getTopPlayers(playersOrder, roundInfo, CONFIG.MAX_PLAYERS_DISPLAY);
    
    const startTime = formatDate(tournament.start_time || tournament.startTime);
    const endTime = tournament.finish_time || tournament.endTime;
    const duration = startTime !== 'N/A' && endTime 
        ? calculateDuration(tournament.start_time || tournament.startTime, endTime)
        : 'N/A';
    
    const timeControl = parseTimeControl(
        tournament.settings?.time_control || tournament.time_control || tournament.timeControl
    );
    
    return {
        name: tournament.name || tournament.title || 'N/A',
        url: tournament.url || tournament.external_url || `${CONFIG.CHESS_COM_URL}/tournament/${tourId}`,
        variant: tournament.settings?.rules || tournament.rules || 'standard',
        startTime,
        duration,
        totalRounds: rounds,
        timeClass: tournament.settings?.time_class || tournament.time_class || 'classical',
        timeControl,
        playersCount: tournament.settings?.registered_user_count || tournament.players_registered || tournament.players?.length || 0,
        players,
        points
    };
}

// ============================================================================
// HTML RENDERING
// ============================================================================

/**
 * Generate player cell HTML
 */
async function generatePlayerCell(username, points) {
    if (!username) {
        return '<td style="color: var(--primary-warning)">Giải chưa kết thúc!</td>';
    }
    
    // Check special players
    const special = SPECIAL_PLAYERS.get(username.toLowerCase());
    if (special) {
        return `<td><a href="${URLs.member(special.name)}" target="_top"><strong>${special.name}</strong></a></td>`;
    }
    
    // Fetch player data
    const playerData = await fetchPlayerData(username);
    const parsed = parsePlayerData(playerData);
    
    const { username: name, status, avatar } = parsed;
    const avatarUrl = avatar && avatar !== 'N/A' 
        ? avatar 
        : `${CONFIG.CHESS_COM_URL}/bundles/web/images/user-image.007dad08.svg`;
    
    const badge = HTML.userBadge(status);
    
    return `<td>
        <div class="post-user-component">
            <a class="cc-avatar-component post-user-avatar">
                <img class="cc-avatar-img" src="${avatarUrl}" height="50" width="50" alt="${name}">
            </a>
            <div class="post-user-details">
                <div class="user-tagline-component">
                    <a class="user-username-component user-tagline-username" href="${URLs.member(name)}" target="_blank">${name}</a>
                </div>
                <div class="post-user-status">
                    <span>${badge}</span>
                    <span>${points} ĐIỂM</span>
                </div>
            </div>
        </div>
    </td>`;
}

/**
 * Generate tournament row HTML
 */
async function generateTournamentRow(parsed) {
    if (!parsed) return '';
    
    const formatStr = HTML.timeControlFormat(parsed.timeControl, parsed.timeClass)
        + HTML.variantLink(parsed.variant);
    
    const tournamentFormat = parsed.totalRounds === 1
        ? ` Đấu trường Arena ${parsed.duration}`
        : ` Hệ Thụy Sĩ ${parsed.totalRounds} vòng`;
    
    let html = '<tr>\n';
    html += `    <td><a href="${parsed.url}" target="_top">${parsed.name}</a></td>\n`;
    html += `    <td>${parsed.startTime}</td>\n`;
    html += `    <td>${formatStr}${tournamentFormat}</td>\n`;
    html += `    <td>${parsed.playersCount}</td>\n`;
    
    for (let i = 0; i < CONFIG.MAX_PLAYERS_DISPLAY; i++) {
        const username = parsed.players[i] || '';
        const pts = parsed.points[i] || 0;
        const playerCell = await generatePlayerCell(username, pts);
        html += `    ${playerCell}\n`;
    }
    
    html += '</tr>\n';
    return html;
}

// ============================================================================
// MAIN RENDERING FUNCTION
// ============================================================================

/**
 * Main function: Fetch all tournaments and render table
 */
async function fetchAndRenderTournaments(eventType = 'tvlt', containerId = 'tournament-table') {
    console.log(`[fetchAndRenderTournaments] Starting for event: ${eventType}`);
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`[fetchAndRenderTournaments] Container ${containerId} not found`);
        return;
    }
    
    container.innerHTML = '<div class="loading">Đang xử lý dữ liệu...</div>';
    
    try {
        const tourIds = await getIds(eventType);
        console.log(`[fetchAndRenderTournaments] Found ${tourIds.length} tournaments`);
        
        if (tourIds.length === 0) {
            container.innerHTML = '<div class="error">Không tìm thấy giải đấu nào.</div>';
            return;
        }
        
        const initialHTML = `<input type="text" id="searchInput" class="search-bar" onkeyup="searchTable()" placeholder="Tìm kiếm trong bảng">
            <div id="loading-status" style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
                Đang hiển thị:&nbsp;&nbsp;<span id="statusIcon" class="bx bx-dots-horizontal-rounded" style="color: var(--primary-warning)"></span>&nbsp;<span><span id="current-tournament">0</span>/<span id="total-tournaments">${tourIds.length}</span>&nbsp;giải đấu</span>
            </div>
            <div class="table">
                <table class="styled-table" id="tournament-results-table">
                    <thead>
                    <tr>
                        <th class="name-tour">Giải đấu</th>
                        <th class="organization-day">Thời gian bắt đầu</th>
                        <th class="rules">Thể lệ</th>
                        <th class="players">Số kỳ thủ</th>
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
            <br><br><hr>
        `;
        
        container.innerHTML = initialHTML;
        
        const tbody = document.getElementById('tournament-tbody');
        let successCount = 0;
        
        // Add skeleton rows
        const skeletonRows = tourIds.map((_, i) => {
            const tr = document.createElement('tr');
            tr.innerHTML = HTML.skeletonRow();
            tr.classList.add('skeleton-row');
            tr.id = `skeleton-${i}`;
            tbody.appendChild(tr);
            return tr;
        });
        
        console.log(`[fetchAndRenderTournaments] Added ${tourIds.length} skeleton rows`);
        
        // Fetch all tournament data concurrently
        console.log(`[fetchAndRenderTournaments] Fetching all tournament data concurrently...`);
        
        const processResults = await Promise.allSettled(
            tourIds.map(async (tourId, index) => {
                const tourData = await fetchTournamentData(tourId);
                if (!tourData) return null;
                
                const parsed = await parseTournamentData(tourData, tourId);
                if (!parsed) return null;
                
                // Pre-fetch players
                await fetchPlayerDataBatch(parsed.players);
                
                // Generate row
                const row = await generateTournamentRow(parsed);
                return { row, index };
            })
        );
        
        // Render results
        processResults.forEach((result) => {
            if (result.status === 'fulfilled' && result.value) {
                const { row, index } = result.value;
                const skeletonRow = skeletonRows[index];
                
                if (skeletonRow?.parentNode) {
                    const tdContent = row
                        .replace(/^\s*<tr>\n\s*/, '')
                        .replace(/\s*<\/tr>\s*$/, '');
                    skeletonRow.innerHTML = tdContent;
                    skeletonRow.classList.remove('skeleton-row');
                }
                
                successCount++;
                document.getElementById('current-tournament').textContent = successCount;
            }
        });
        
        // Update status
        if (successCount === 0) {
            container.innerHTML = '<div class="error">Đã có lỗi xảy ra. Hãy thử tải lại trang!</div>';
            return;
        }
        
        const statusIcon = document.getElementById('statusIcon');
        if (successCount === tourIds.length) {
            statusIcon.style.color = 'var(--primary-sucess)';
            statusIcon.className = 'fa fa-check';
        } else {
            statusIcon.style.color = 'var(--color-red)';
            statusIcon.className = 'fa fa-times';
        }
        
        console.log(`[fetchAndRenderTournaments] Complete! ${successCount}/${tourIds.length} loaded`);
        
    } catch (error) {
        console.error('[fetchAndRenderTournaments] Error:', error);
        container.innerHTML = `<div class="error">Lỗi: ${error.message}</div>`;
    }
}

// ============================================================================
// AUTO-INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('[tournament-fetcher.js] DOM loaded, ready to fetch tournaments');
    
    const containers = document.querySelectorAll('[data-fetch-tournament]');
    containers.forEach(container => {
        const eventType = container.dataset.fetchTournament || 'tvlt';
        const containerId = container.id || 'tournament-table';
        console.log(`[tournament-fetcher.js] Auto-fetching tournaments for: ${eventType}`);
        fetchAndRenderTournaments(eventType, containerId);
    });
});