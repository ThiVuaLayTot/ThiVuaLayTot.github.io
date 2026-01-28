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

// Global pause state
let isPaused = false;

// Player data cache
const playerCache = new Map();
const BATCH_SIZE = Infinity; // Run all tournaments concurrently

// Pre-compile regex for time control parsing
const TIME_CONTROL_REGEX = /^(\d+)\+(\d+)$/;

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
    try {
        let timestamp = tournament.start_time || tournament.startTime;
        
        if (!timestamp) {
            startTime = 'N/A';
        } else if (typeof timestamp === 'string') {
            const date = new Date(timestamp);
            startTime = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
        } else {
            const date = new Date(parseInt(timestamp) * 1000);
            startTime = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
        }
    } catch (e) {
        console.warn(`[parseTournamentData] Error parsing date: ${tournament.start_time}`);
    }

    return {
        name: tournament.name || tournament.title || 'N/A',
        url: tournament.url || tournament.external_url || `//www.chess.com/tournament/${tourId}`,
        variant: tournament.settings?.rules || tournament.rules || 'standard',
        startTime,
        totalRounds: rounds,
        timeClass: tournament.settings?.time_class || tournament.time_class || 'N/A',
        timeControl,
        playersCount: tournament.settings?.registered_user_count || tournament.players_registered || tournament.players?.length || 'N/A',
        players,
        points
    };
}

/**
 * Generate player cell HTML
 */
async function generatePlayerCell(username, points) {
    if (!username) {
        return '<td>N/A</td>';
    }

    // Check special players (optimized with Map lookup)
    const special = SPECIAL_PLAYERS_LOWER.get(username.toLowerCase());
    if (special) {
        return `<td><a href="//www.chess.com/member/${special.name}" target="_top"><strong>${special.name}</strong></a></td>`;
    }

    // Fetch player data
    const playerData = await fetchPlayerData(username);
    const parsed = parsePlayerData(playerData);
    
    const { username: name, status, avatar } = parsed;
    const cc = '//www.chess.com';
    const defaultAvatar = `${cc}/bundles/web/images/user-image.007dad08.svg`;
    const avatarUrl = avatar && avatar !== 'N/A' ? avatar : defaultAvatar;

    let badgeHTML = '';
    let badgeClass = '';

    if (status === 'closed:abuse') {
        badgeHTML = `<div class="user-badges-component"><div class="user-badges-badge user-badges-closed"><span>Closed: Abuse</span></div></div>`;
        badgeClass = 'closed-abuse';
    } else if (status === 'closed:fair_play_violations') {
        badgeHTML = `<div class="user-badges-component"><div class="user-badges-badge user-badges-closed"><span>Closed: Gian lận</span></div></div>`;
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
    if (parsed.timeClass === 'bullet') format += 'Bullet';
    else if (parsed.timeClass === 'blitz') format += 'Blitz';
    else format += 'Rapid';

    const ruleMap = {
        'chess960': ' Chess960,',
        'kingofthehill': ' KOTH,',
        'crazyhouse': ' Crazyhouse,',
        'bughouse': ' Bughouse,',
        'threecheck': ' 3 Chiếu,'
    };

    format += ruleMap[parsed.variant.toLowerCase()] || ',';
    format += parsed.totalRounds === 1 ? ' Đấu trường Arena' : ` Hệ Thụy Sĩ ${parsed.totalRounds} vòng`;
    
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
    <button id="pause-btn" onclick="togglePause()" style="padding: 8px 16px; margin-left: 10px; background: #ff284839; color: #FF2849; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;"><svg class="svg-icon" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><g stroke="#ff2849" stroke-linecap="round" stroke-width="2"><rect height="14" rx="1.5" width="3" x="15" y="5"></rect><rect height="14" rx="1.5" width="3" x="6" y="5"></rect></g></svg> Tạm dừng</button>
    <div id="loading-status" style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
        Đang hiển thị:&nbsp;&nbsp;<span id="statusIcon" class="bx bx-dots-horizontal-rounded" style="color: var(--primary-warning)"></span>&nbsp;<span><span id="current-tournament">0</span>/<span id="total-tournaments">${tourIds.length}</span>&nbsp;giải đấu</span>
        <span id="pause-status" style="margin-left: 20px; color: #ff6b6b; font-weight: bold;"></span>
    </div>
    <div class="table">
        <table class="styled-table" id="tournament-results-table">
            <thead>
            <tr>
                <th class="name-tour">Tên giải</th>
                <th class="organization-day">Ngày tổ chức</th>
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

/**
 * Toggle pause state
 */
function togglePause() {
    isPaused = !isPaused;
    const btn = document.getElementById('pause-btn');
    if (isPaused) {
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512">
    <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"></path> </svg> Tiếp tục`;
        btn.style.background = '#51cf663c';
        btn.style.color = 'var(--color-light-green)';
    } else {
        btn.innerHTML = `<svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><g stroke="#ff2849" stroke-linecap="round" stroke-width="2"><rect height="14" rx="1.5" width="3" x="15" y="5"></rect><rect height="14" rx="1.5" width="3" x="6" y="5"></rect></g></svg> Tạm dừng`;
        btn.style.background = '#ff284839';
        btn.style.color = '#FF2849';
    }
    console.log(`[togglePause] Pause state: ${isPaused}`);
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