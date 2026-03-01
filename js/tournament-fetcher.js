/**
 * Tournament Data Fetcher
 * Automatically fetches tournament data from Chess.com API and renders table
 */

const SPECIAL_PLAYERS = {
    'm_dinhhoangviet': { name: 'M-DinhHoangViet', special: true },
    'tungjohn_playing_chess': { name: 'M-DinhHoangViet', special: true },
    'thangthukquantrong': { name: 'thangthukquantrong', special: true }
};

// Optimize special players lookup with Map
const SPECIAL_PLAYERS_LOWER = new Map(Object.entries(SPECIAL_PLAYERS).map(([k, v]) => [k.toLowerCase(), v]));

const CHESS_COM_BASE = 'https://api.chess.com/pub';
const GIST_BASE = 'https://gist.githubusercontent.com/M-DinhHoangViet/9c53a11fca709a656076bf6de7c118b0/raw';

// Player data cache
const playerCache = new Map();
const BATCH_SIZE = Infinity; // Run all tournaments concurrently

// Pre-compile regex for time control parsing
const TIME_CONTROL_REGEX = /^(\d+)\+(\d+)$/;

/**
 * Calculate tournament duration
 */
function calculateDuration(startDate, endDate) {
    if (!startDate || !endDate) return 'N/A';
    
    const start = typeof startDate === 'string' ? new Date(startDate) : new Date(startDate * 1000);
    const end = typeof endDate === 'string' ? new Date(endDate) : new Date(endDate * 1000);
    
    if (isNaN(start) || isNaN(end)) return 'N/A';
    
    const diffMs = end - start;
    if (diffMs < 0) return 'N/A';
    
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
        return `${diffDays} ngày`;
    } else if (diffHours > 0) {
        const remainingMinutes = diffMinutes % 60;
        if (remainingMinutes === 0) {
            return `${diffHours} tiếng`;
        } else {
            return `${diffHours} tiếng ${remainingMinutes} phút`;
        }
    } else if (diffMinutes > 0) {
        return `${diffMinutes} phút`;
    } else {
        return `${diffSeconds} giây`;
    }
}

/**
 * Fetch tournament IDs from gist
 */
async function getIds(eventType) {
    try {
        const url = `${GIST_BASE}/${eventType}.txt`;
        const response = await fetch(url);
        const text = await response.text();
        return text.split('\n').filter(line => line.trim());
    } catch (error) {
        console.error(`[getIds] Error fetching ${eventType}:`, error);
        return [];
    }
}

/**
 * Fetch tournament details from Chess.com API
 */
async function fetchTournamentData(tourId) {
    try {
        const url = `${CHESS_COM_BASE}/tournament/${tourId}`;
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`[fetchTournamentData] ${tourId}: ${response.status}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`[fetchTournamentData] ${tourId}:`, error);
        return null;
    }
}

/**
 * Fetch round data to get player points
 */
async function fetchRoundData(tourId, roundNum) {
    try {
        const url = `${CHESS_COM_BASE}/tournament/${tourId}/${roundNum}`;
        const response = await fetch(url);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error(`[fetchRoundData] ${tourId} round ${roundNum}:`, error);
        return null;
    }
}

/**
 * Fetch player profile data (with caching)
 */
async function fetchPlayerData(username) {
    // Check cache first
    if (playerCache.has(username)) {
        return playerCache.get(username);
    }

    try {
        const url = `${CHESS_COM_BASE}/player/${username}`;
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();
        
        // Store in cache
        playerCache.set(username, data);
        return data;
    } catch (error) {
        console.error(`[fetchPlayerData] ${username}:`, error);
        return null;
    }
}

/**
 * Batch fetch player data (optimization)
 */
async function fetchPlayerDataBatch(usernames) {
    const unique = [...new Set(usernames)];
    const missing = unique.filter(u => !playerCache.has(u));
    if (missing.length === 0) return;
    
    const promises = missing.map(u => fetchPlayerData(u).catch(() => null));
    await Promise.allSettled(promises);
}

/**
 * Sort players by points from round data
 */
function sortPlayer(playersOrder, roundData) {
    if (!roundData) return { players: playersOrder.slice(0, 7), points: new Array(7).fill(0) };

    const pointsMap = new Map();
    
    if (roundData.players && Array.isArray(roundData.players)) {
        roundData.players.forEach(p => {
            if (p.username) {
                pointsMap.set(p.username.toLowerCase(), p.points || 0);
            }
        });
    }

    if (!playersOrder || playersOrder.length === 0) {
        return { players: [], points: [] };
    }

    const players = [];
    const points = [];
    
    for (let i = 0; i < Math.min(7, playersOrder.length); i++) {
        const username = playersOrder[i];
        const usernameLower = username.toLowerCase();
        const pts = pointsMap.get(usernameLower) || 0;
        
        players.push(username);
        points.push(pts);
    }

    return { players, points };
}

/**
 * Parse player data
 */
function parsePlayerData(playerData) {
    if (!playerData) {
        return {
            username: 'unknown',
            status: 'N/A',
            avatar: 'N/A'
        };
    }

    const p = playerData.player || playerData;
    
    if (!p || typeof p !== 'object') {
        return {
            username: 'unknown',
            status: 'N/A',
            avatar: 'N/A'
        };
    }

    return {
        username: p.username || 'unknown',
        status: p.status || 'N/A',
        avatar: p.avatar || 'N/A'
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
        console.error(`[parseTournamentData] Invalid tournament data for ${tourId}`, data);
        return null;
    }
    
    const rounds = tournament.settings?.total_rounds || tournament.rounds || tournament.total_rounds || 0;
    
    let roundInfo = null;
    if (rounds > 0) {
        roundInfo = await fetchRoundData(tourId, rounds);
    }

    const playersOrder = tournament.players?.map(p => {
        if (typeof p === 'object' && p.username) return p.username;
        return p;
    }).filter(Boolean) || [];
    const { players, points } = sortPlayer(playersOrder, roundInfo);

    // Parse time control (optimized with pre-compiled regex)
    const tcRaw = tournament.settings?.time_control || tournament.time_control || tournament.timeControl || '3+0';
    let timeControl = tcRaw || '3+0';
    try {
        if (tcRaw && typeof tcRaw === 'string') {
            const match = tcRaw.match(TIME_CONTROL_REGEX);
            if (match) {
                const baseNum = parseInt(match[1]);
                const incNum = parseInt(match[2]);
                timeControl = baseNum >= 60 ? `${Math.floor(baseNum / 60)}+${incNum}` : `${baseNum}+${incNum}`;
            } else {
                const num = parseInt(tcRaw);
                if (!isNaN(num)) {
                    timeControl = num >= 60 ? `${Math.floor(num / 60)}+0` : `${num}+0`;
                }
            }
        } else if (typeof tcRaw === 'number') {
            timeControl = tcRaw >= 60 ? `${Math.floor(tcRaw / 60)}+0` : `${tcRaw}+0`;
        }
    } catch (e) {
        console.warn(`[parseTournamentData] Error parsing time control: ${tcRaw}`);
        timeControl = '3+0';
    }

    let startTime = 'N/A';
    let duration = 'N/A';
    
    try {
        let startTimestamp = tournament.start_time || tournament.startTime;
        let endTimestamp = tournament.finish_time || tournament.endTime;
        
        if (!startTimestamp) {
            startTime = 'N/A';
        } else if (typeof startTimestamp === 'string') {
            const date = new Date(startTimestamp);
            startTime = `${String(date.getHours()).padStart(2, '0')}h${String(date.getMinutes()).padStart(2, '0')}, ngày ${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
        } else {
            const date = new Date(parseInt(startTimestamp) * 1000);
            startTime = `${String(date.getHours()).padStart(2, '0')}h${String(date.getMinutes()).padStart(2, '0')}, ngày ${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
        }
        
        // Calculate duration if both times are available
        if (startTimestamp && endTimestamp) {
            duration = calculateDuration(startTimestamp, endTimestamp);
        }
    } catch (e) {
        console.warn(`[parseTournamentData] Error parsing date: ${tournament.start_time}`);
    }

    return {
        name: tournament.name || tournament.title || 'N/A',
        url: tournament.url || tournament.external_url || `//chess.com/tournament/${tourId}`,
        variant: tournament.settings?.rules || tournament.rules || 'standard',
        startTime,
        duration,
        totalRounds: rounds,
        timeClass: tournament.settings?.time_class || tournament.time_class || 'N/A',
        timeControl,
        playersCount: tournament.settings?.registered_user_count || tournament.players_registered || tournament.players?.length || ' 0',
        players,
        points
    };
}

/**
 * Generate player cell HTML
 */
async function generatePlayerCell(username, points) {
    if (!username) {
        return '<td style="color: var(--primary-warning)">Giải chưa kết thúc!</td>';
    }

    // Check special players (optimized with Map lookup)
    const cc = '//chess.com';
    const special = SPECIAL_PLAYERS_LOWER.get(username.toLowerCase());
    if (special) {
        return `<td><a href="${cc}/member/${special.name}" target="_top"><strong>${special.name}</strong></a></td>`;
    }

    // Fetch player data
    const playerData = await fetchPlayerData(username);
    const parsed = parsePlayerData(playerData);
    
    const { username: name, status, avatar } = parsed;
    const defaultAvatar = `${cc}/bundles/web/images/user-image.007dad08.svg`;
    const avatarUrl = avatar && avatar !== 'N/A' ? avatar : defaultAvatar;

    let badgeHTML = '';
    let badgeClass = '';

    if (status === 'closed:abuse') {
        badgeHTML = `<div class="user-badges-component"><div class="user-badges-badge user-badges-closed"><span>Closed: Abuse</span></div></div>`;
        badgeClass = 'closed-abuse';
    } else if (status === 'closed:fair_play_violations') {
        badgeHTML = `<div class="user-badges-component"><div class="user-badges-badge user-badges-closed"><span>Closed: Cheating</span></div></div>`;
        badgeClass = 'closed-fair';
    } else if (status === 'closed') {
        badgeHTML = `<div class="user-badges-component"><div class="user-badges-badge user-badges-closed"><span>Closed: Inactive</span></div></div>`;
        badgeClass = 'closed';
    } else if (status === 'premium') {
        badgeHTML = `<div class="user-badges-component"><div class="user-badges-badge user-badges-premium"><span>Chess.com Membership</span></div></div>`;
        badgeClass = 'premium';
    }

    return `<td>
        <div class="post-user-component">
            <a class="cc-avatar-component post-user-avatar">
                <img class="cc-avatar-img" src="${avatarUrl}" height="50" width="50">
            </a>
            <div class="post-user-details">
                <div class="user-tagline-component">
                    <a class="user-username-component user-tagline-username" href="${cc}/member/${name}" target="_blank">${name}</a>
                </div>
                <div class="post-user-status">
                    <span>${badgeHTML}</span>
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

    let html = '<tr>\n';

    html += `    <td><a href="${parsed.url}" target="_top">${parsed.name}</a></td>\n`;
    html += `    <td>${parsed.startTime}</td>\n`;

    let format = parsed.timeControl + ' ';
    if (parsed.timeClass === 'bullet') format += `Bullet <img src"${cc}/bundles/web/images/icons/smileys/2x/bullet.png" width="15px" height="15px">`;
    else if (parsed.timeClass === 'blitz') format += `Blitz <img src"${cc}/bundles/web/images/icons/smileys/2x/blitz.png" width="15px" height="15px">`;
    else format += `Rapid <img src"${cc}/bundles/web/images/icons/smileys/2x/live.png" width="15px" height="15px">`;

    const ruleMap = {
        'chess960': ` <a href="${cc}/terms/chess960" target="_blank">Chess960 <img src="${cc}/bundles/web/images/variants/live_960_orange.svg" width="15px" height="15px"></a>`,
        'kingofthehill': ` <a href="${cc}/terms/king-of-the-hill" target="_blank">KOTH <img src"${cc}/bundles/web/images/variants/koth.svg" width="15px" height="15px"></a>`,
        'crazyhouse': `  <a href="${cc}/terms/crazyhouse-chess" target="_blank">Crazyhouse <img src="${cc}/bundles/web/images/variants/crazyhouse.svg" width="15px" height="15px"></a>`,
        'bughouse': `  <a href="${cc}/terms/bughouse-chess" target="_blank">Bughouse <img src="${cc}/bundles/web/images/variants/bughouse.svg" width="15px" height="15px"></a>`,
        'threecheck': ` <a href="${cc}/terms/3-check-chess" target="_blank">3 Chiếu <img src="${cc}/bundles/web/images/variants/3check.svg" width="15px" height="15px"></a>`
    };

    format += ruleMap[parsed.variant.toLowerCase()] || `<br>`;
    format += parsed.totalRounds === 1 ? ` Đấu trường Arena ${parsed.duration}` : ` Hệ Thụy Sĩ ${parsed.totalRounds} vòng`;
    
    html += `    <td>${format}</td>\n`;
    html += `    <td>${parsed.playersCount}</td>\n`;
    
    for (let i = 0; i < 6; i++) {
        const username = parsed.players[i] || '';
        const pts = parsed.points[i] || 0;
        const playerCell = await generatePlayerCell(username, pts);
        html += `    ${playerCell}\n`;
    }
    
    html += '</tr>\n';
    return html;
}

/**
 * Generate skeleton loading row HTML
 */
function generateSkeletonRow() {
    return `<td><div class="skeleton skeleton-text" style="width: 80%;"></div></td>
    <td><div class="skeleton skeleton-text" style="width: 70%;"></div></td>
    <td><div class="skeleton skeleton-text" style="width: 75%;"></div></td>
    <td><div class="skeleton skeleton-text" style="width: 60%;"></div></td>
    <td><div class="skeleton skeleton-avatar"></div></td>
    <td><div class="skeleton skeleton-avatar"></div></td>
    <td><div class="skeleton skeleton-avatar"></div></td>
    <td><div class="skeleton skeleton-avatar"></div></td>
    <td><div class="skeleton skeleton-avatar"></div></td>
    <td><div class="skeleton skeleton-avatar"></div></td>`;
}

/**
 * Process a single tournament
 */
async function processTournament(tourId, index, totalCount, skeletonRow = null) {
    try {
        console.log(`[processTournament] Processing: ${tourId} (${index}/${totalCount})`);
        
        const tourData = await fetchTournamentData(tourId);
        if (!tourData) {
            console.warn(`[processTournament] No data for tournament: ${tourId}`);
            return null;
        }

        const parsed = await parseTournamentData(tourData, tourId);
        if (!parsed) {
            console.warn(`[processTournament] Failed to parse tournament: ${tourId}`);
            return null;
        }

        return {
            parsed,
            row: await generateTournamentRow(parsed),
            skeletonRow
        };
    } catch (error) {
        console.error(`[processTournament] Error processing ${tourId}:`, error);
        return null;
    }
}

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

        const initialHTML = `<input type="text" id="searchInput" class="search-bar" onkeyup="searchTable()" placeholder="Tìm kiếm">
    <div id="loading-status" style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
        Đang hiển thị:&nbsp;&nbsp;<span id="statusIcon" class="bx bx-dots-horizontal-rounded" style="color: var(--primary-warning)"></span>&nbsp;<span><span id="current-tournament">0</span>/<span id="total-tournaments">${tourIds.length}</span>&nbsp;giải đấu</span>
    </div>
    <div class="table">
        <table class="styled-table" id="tournament-results-table">
            <thead>
            <tr>
                <th class="name-tour">Tên giải</th>
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
    <br><br><hr>`;

        container.innerHTML = initialHTML;
        
        const tbody = document.getElementById('tournament-tbody');
        let successCount = 0;

        // Add skeleton rows first
        const skeletonRows = [];
        for (let i = 0; i < tourIds.length; i++) {
            const skeletonHTML = generateSkeletonRow();
            const tr = document.createElement('tr');
            tr.innerHTML = skeletonHTML;
            tr.classList.add('skeleton-row');
            tr.id = `skeleton-${i}`;
            tbody.appendChild(tr);
            skeletonRows.push(tr);
        }
        console.log(`[fetchAndRenderTournaments] Added ${tourIds.length} skeleton rows`);

        // Optimization: Fetch all tournament data first (concurrent)
        console.log(`[fetchAndRenderTournaments] Fetching all tournament data concurrently...`);
        const tourDataPromises = tourIds.map((tourId, index) => 
            fetchTournamentData(tourId)
                .then(data => ({ data, index }))
                .catch(err => ({ data: null, index }))
        );
        
        // Process results as they arrive
        const processResultPromises = tourDataPromises.map(promise =>
            promise.then(async ({ data, index }) => {
                if (!data) return null;
                
                const tourId = tourIds[index];
                const parsed = await parseTournamentData(data, tourId);
                if (!parsed) return null;
                
                // Pre-fetch players for this tournament only
                await fetchPlayerDataBatch(parsed.players);
                
                // Generate row for this tournament
                const row = await generateTournamentRow(parsed);
                
                return { row, index, parsed };
            })
        );

        // Render skeleton replacement as results complete
        const results = await Promise.allSettled(processResultPromises);
        
        results.forEach((result) => {
            if (result.status === 'fulfilled' && result.value) {
                const { row, index } = result.value;
                const skeletonRow = skeletonRows[index];
                
                if (skeletonRow && skeletonRow.parentNode) {
                    const tdContent = row.replace(/^\s*<tr>\n\s*/, '').replace(/\s*<\/tr>\s*$/, '');
                    skeletonRow.innerHTML = tdContent;
                    skeletonRow.classList.remove('skeleton-row');
                    console.log(`[fetchAndRenderTournaments] Replaced skeleton ${index}`);
                }
                
                successCount++;
                document.getElementById('current-tournament').textContent = successCount;
            }
        });
        
        if (successCount === 0) {
            container.innerHTML = '<div class="error">Đã có lỗi xảy ra, không thể tải dữ liệu giải đấu. Hãy thử tải lại trang!</div>';
            return;
        }
        
        if (successCount === tourIds.length) {
            document.getElementById('statusIcon').style.color = 'var(--primary-sucess)';
            document.getElementById('statusIcon').className = 'fa fa-check';
        } else {
            document.getElementById('statusIcon').style.color = 'var(--color-red)';
            document.getElementById('statusIcon').className = 'fa fa-times';
        }

        console.log(`[fetchAndRenderTournaments] Rendering complete! ${successCount}/${tourIds.length} tournaments loaded`);

    } catch (error) {
        console.error('[fetchAndRenderTournaments] Error:', error);
        container.innerHTML = `<div class="error">Lỗi: ${error.message}</div>`;
    }
}


// Auto-run when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('[tournament-fetcher.js] DOM loaded, ready to fetch tournaments');
    
    // Check if there's a tournament container with data attribute
    const containers = document.querySelectorAll('[data-fetch-tournament]');
    if (containers.length > 0) {
        containers.forEach(container => {
            const eventType = container.dataset.fetchTournament || 'tvlt';
            const containerId = container.id || 'tournament-table';
            console.log(`[tournament-fetcher.js] Auto-fetching tournaments for: ${eventType}`);
            fetchAndRenderTournaments(eventType, containerId);
        });
    }
});