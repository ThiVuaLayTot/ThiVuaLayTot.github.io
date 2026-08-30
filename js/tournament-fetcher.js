/**
 * @file Tournament Data Fetcher
 * @description Fetches and renders chess tournament data from Chess.com API and Gist sources.
 */

(function() {
    const CONFIG = {
        CHESS_COM_BASE: 'https://api.chess.com/pub',
        CHESS_COM_URL: 'https://www.chess.com',
        GIST_BASE: 'https://gist.githubusercontent.com/M-DinhHoangViet/9c53a11fca709a656076bf6de7c118b0/raw',
        MAX_PLAYERS: 6,
        MAX_CONCURRENT: 10,
        CACHE_PREFIX: 'tvlt_',
        CACHE_TTL: { p: 604800000, t: 86400000, f: 2592000000 }
    };

    const SPECIAL_PLAYERS = new Map([
        ['m_dinhhoangviet', 'M-DinhHoangViet'],
        ['tungjohn_playing_chess', 'M-DinhHoangViet'],
        ['thangthukquantrong', 'thangthukquantrong'],
        ['manh_duy', 'ManhDuy19']
    ]);

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
        'lightning': { name: 'Bullet', p: '/bundles/web/images/icons/smileys/2x/bullet.png' },
        'bullet': { name: 'Bullet', p: '/bundles/web/images/icons/smileys/2x/bullet.png' },
        'blitz': { name: 'Blitz', p: '/bundles/web/images/icons/smileys/2x/blitz.png' },
        'rapid': { name: 'Rapid', p: '/bundles/web/images/icons/smileys/2x/live.png' },
        'standard': { name: 'Rapid', p: '/bundles/web/images/icons/smileys/2x/live.png' }
    };

    const BADGE_CONFIG = {
        'closed:abuse': { c: 'user-badges-closed', i: 'bx bx-dislike', t: 'Bị khóa: Lạm dụng' },
        'closed:fair_play_violations': { c: 'user-badges-closed', i: 'bx bx-block', t: 'Bị khóa: Fair Play' },
        'closed': { c: 'user-badges-inactive', i: 'bx bx-no-signal', t: 'Đã khóa' },
        'premium': { c: 'user-badges-premium', i: 'bx bxs-star', t: 'Premium' }
    };

    const Cache = {
        mem: new Map(),
        get(k) {
            if (this.mem.has(k)) return this.mem.get(k);
            try {
                const stored = localStorage.getItem(CONFIG.CACHE_PREFIX + k);
                if (stored) {
                    const { val, exp } = JSON.parse(stored);
                    if (Date.now() < exp) {
                        this.mem.set(k, val);
                        return val;
                    }
                    localStorage.removeItem(CONFIG.CACHE_PREFIX + k);
                }
            } catch (e) {}
            return null;
        },
        set(k, val, type = 't') {
            this.mem.set(k, val);
            try {
                const exp = Date.now() + (CONFIG.CACHE_TTL[type] || CONFIG.CACHE_TTL.t);
                localStorage.setItem(CONFIG.CACHE_PREFIX + k, JSON.stringify({ val, exp }));
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    Object.keys(localStorage)
                        .filter(k => k.startsWith(CONFIG.CACHE_PREFIX))
                        .forEach(k => localStorage.removeItem(k));
                }
            }
        }
    };

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

    // Helper functions
    const createImg = (src, w = 15) => `<img src="${src}" width="${w}" height="${w}" alt="" style="vertical-align:middle">`;

    const formatVariantLink = (variant, setup) => {
        const config = VARIANTS[variant.toLowerCase()] || { name: variant, url: '/terms', icon: '/bundles/web/images/icons/smileys/2x/board.png' };
        const url = CONFIG.CHESS_COM_URL + config.url;
        const img = createImg(CONFIG.CHESS_COM_URL + config.icon);
        
        if (setup) {
            return `<br><a href="javascript:void(0)" class="custom-variant-link" data-setup="${setup}">${config.name}${img}</a><br>`;
        }
        return `<br><a href="${url}" target="_blank">${config.name} ${img}</a><br>`;
    };

    const formatTimeControl = (tc, timeClass) => {
        const icon = TIME_ICONS[timeClass];
        const iconHtml = icon ? createImg(CONFIG.CHESS_COM_URL + icon.p) : '';
        return `${tc} ${icon?.name || 'Standard'}${iconHtml}`;
    };

    const formatBadge = (status) => {
        const badge = BADGE_CONFIG[status];
        if (!badge) return '';
        return `<div class="user-badges-component"><div class="user-badges-badge ${badge.c}"><span class="${badge.i}"></span><span>${badge.t}</span></div></div>`;
    };

    // Utility functions
    async function fetchRetry(url, json = true) {
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const response = await fetch(url);
                if (response.status === 429) {
                    await new Promise(r => setTimeout(r, 2000));
                    continue;
                }
                if (!response.ok) return null;
                return json ? await response.json() : await response.text();
            } catch (e) {
                if (attempt === 1) return null;
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    }

    const getTour = async (id) => {
        const cached = Cache.get(`t_${id}`);
        if (cached) return cached;
        const data = await fetchRetry(`${CONFIG.CHESS_COM_BASE}/tournament/${id}`);
        if (data) {
            const isFinished = data.status === 'finished' || data.tournament?.status === 'finished';
            Cache.set(`t_${id}`, data, isFinished ? 'f' : 't');
        }
        return data;
    };

    const getPlayer = async (username) => {
        const cached = Cache.get(`p_${username}`);
        if (cached) return cached;
        const data = await fetchRetry(`${CONFIG.CHESS_COM_BASE}/player/${username}`);
        if (data) Cache.set(`p_${username}`, data, 'p');
        return data;
    };

    function formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp * 1000);
        if (isNaN(date)) return 'N/A';
        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const mo = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${h}h${m}, ngày ${d}/${mo}/${y}`;
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

    // Helper to safely access nested tournament data
    function getTournamentData(data) {
        return {
            rounds: data.settings?.total_rounds || data.rounds || data.total_rounds || 0,
            rules: data.settings?.rules || data.rules || 'standard',
            setup: data.settings?.initial_setup || null,
            timeControl: data.settings?.time_control || data.time_control || data.timeControl,
            timeClass: data.settings?.time_class || data.time_class,
            registeredCount: data.settings?.registered_user_count || data.players_registered || data.players?.length || 0,
            startTime: data.start_time || data.startTime,
            endTime: data.finish_time || data.endTime
        };
    }

    async function renderPlayer(username, pts) {
        if (!username) {
            return '<td style="color:var(--primary-warning)">Giải chưa kết thúc!</td>';
        }

        const special = SPECIAL_PLAYERS.get(username.toLowerCase());
        if (special) {
            return `<td><a href="${CONFIG.CHESS_COM_URL}/member/${special}" target="_top"><strong>${special}</strong></a></td>`;
        }

        const playerData = await getPlayer(username);
        const avatar = playerData?.avatar || 'https://www.chess.com/bundles/web/images/user-image.007dad08.svg';
        return `<td><div class="post-user-component">
            <a class="cc-avatar-component post-user-avatar" href="https://chess.com/member/${playerData?.username}">
                <img class="cc-avatar-img" src="${avatar}" height="50" width="50" alt="${username}">
            </a>
            <div class="post-user-details">
                <div class="user-tagline-component">
                    <a class="user-username-component user-tagline-username" href="${CONFIG.CHESS_COM_URL}/member/${username}" target="_blank">${username}</a>
                </div>
                <div class="post-user-status">
                    <span>${formatBadge(playerData?.status)}</span>
                    <span>${pts} ĐIỂM</span>
                </div>
            </div>
        </div></td>`;
    }

    function createSkeletonRows(count) {
        return Array.from({ length: count }, () => {
            const tr = document.createElement('tr');
            tr.className = 'skeleton-row';
            let html = `
                <td><div class="skeleton skeleton-text" style="width: 80%;"></div></td>
                <td><div class="skeleton skeleton-text" style="width: 70%;"></div></td>
                <td><div class="skeleton skeleton-text" style="width: 90%;"></div></td>
                <td><div class="skeleton skeleton-text" style="width: 30px; margin: auto;"></div></td>`;
            
            html += Array.from({ length: CONFIG.MAX_PLAYERS }, () => 
                `<td><div class="post-user-component"><div class="skeleton skeleton-avatar"></div>
                    <div class="post-user-details">
                        <div class="skeleton skeleton-text" style="width: 70px;"></div>
                        <div class="skeleton skeleton-text" style="width: 40px;"></div>
                    </div>
                </div></td>`
            ).join('');
            
            tr.innerHTML = html;
            return tr;
        });
    }

    async function init(type = 'tvlt', containerId = 'tournament-table') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '<div class="loading">Đang xử lý dữ liệu...</div>';

        const txt = await fetchRetry(`${CONFIG.GIST_BASE}/${type}.txt`, false);
        const tournamentIds = txt ? txt.split('\n').filter(line => line.trim()) : [];
        
        if (!tournamentIds.length) {
            container.innerHTML = '<div class="error">Không tìm thấy giải đấu.</div>';
            return;
        }

        // Initialize UI
        container.innerHTML = `
            <div class="filter-group-container" style="margin-bottom: 25px;">
                <div class="tour-top-grid">
                    <div class="tour-dropdown" id="tournament-speed-dropdown">
                        <div class="tour-dropdown-btn" onclick="toggleTourDropdown('tournament-speed-dropdown')">
                            <div class="tour-dropdown-btn-content"><i class="bx bx-time"></i><span>Thể lệ</span></div>
                            <span class="bx bx-chevron-down tour-dropdown-arrow"></span>
                        </div>
                        <div class="tour-dropdown-menu" id="timeclass-checkbox-group">
                            <label class="custom-checkbox-container"><input type="checkbox" value="bullet" checked onchange="searchTable()"><span class="checkmark"></span> Bullet (Cờ Siêu chớp)</label>
                            <label class="custom-checkbox-container"><input type="checkbox" value="blitz" checked onchange="searchTable()"><span class="checkmark"></span> Blitz (Cờ chớp)</label>
                            <label class="custom-checkbox-container"><input type="checkbox" value="rapid" checked onchange="searchTable()"><span class="checkmark"></span> Rapid (Cờ Nhanh)</label>
                            <label class="custom-checkbox-container"><input type="checkbox" value="classical" checked onchange="searchTable()"><span class="checkmark"></span> Classical (Cờ chậm)</label>
                        </div>
                    </div>
                    <div class="tour-dropdown" id="tournament-variant-dropdown">
                        <div class="tour-dropdown-btn" onclick="toggleTourDropdown('tournament-variant-dropdown')">
                            <div class="tour-dropdown-btn-content"><i class="bx bxs-chess"></i><span>Biến thể</span></div>
                            <span class="bx bx-chevron-down tour-dropdown-arrow"></span>
                        </div>
                        <div class="tour-dropdown-menu" id="variant-checkbox-group">
                            <label class="custom-checkbox-container"><input type="checkbox" value="standard" checked onchange="searchTable()"><span class="checkmark"></span> Cờ tiêu chuẩn</label>
                            <label class="custom-checkbox-container"><input type="checkbox" value="chess960" checked onchange="searchTable()"><span class="checkmark"></span> Chess960</label>
                            <label class="custom-checkbox-container"><input type="checkbox" value="crazyhouse" checked onchange="searchTable()"><span class="checkmark"></span> Crazyhouse</label>
                            <label class="custom-checkbox-container"><input type="checkbox" value="bughouse" checked onchange="searchTable()"><span class="checkmark"></span> Bughouse</label>
                            <label class="custom-checkbox-container"><input type="checkbox" value="kingofthehill" checked onchange="searchTable()"><span class="checkmark"></span> King of the hill</label>
                            <label class="custom-checkbox-container"><input type="checkbox" value="threecheck" checked onchange="searchTable()"><span class="checkmark"></span> 3 Chiếu</label>
                            <label class="custom-checkbox-container"><input type="checkbox" value="custom" checked onchange="searchTable()"><span class="checkmark"></span> Custom Position</label>
                        </div>
                    </div>
                    <div class="tour-dropdown" id="tournament-format-dropdown">
                        <div class="tour-dropdown-btn" onclick="toggleTourDropdown('tournament-format-dropdown')">
                            <div class="tour-dropdown-btn-content"><i class="bx bx-medal"></i><span>Thể thức</span></div>
                            <span class="bx bx-chevron-down tour-dropdown-arrow"></span>
                        </div>
                        <div class="tour-dropdown-menu" id="format-checkbox-group">
                            <label class="custom-checkbox-container"><input type="checkbox" value="swiss" checked onchange="searchTable()"><span class="checkmark"></span> Hệ Thụy Sĩ (Swiss)</label>
                            <label class="custom-checkbox-container"><input type="checkbox" value="arena" checked onchange="searchTable()"><span class="checkmark"></span> Đấu trường Arena</label>
                        </div>
                    </div>
                    <div class="tour-select-container">
                        <select id="sortFilter" class="tour-select-btn" onchange="searchTable()">
                            <option value="date-desc">Ngày tổ chức (Mới nhất)</option>
                            <option value="date-asc">Ngày tổ chức (Cũ nhất)</option>
                            <option value="players-desc">Kỳ thủ tham gia (Nhiều nhất)</option>
                            <option value="players-asc">Kỳ thủ tham gia (Ít nhất)</option>
                        </select>
                    </div>
                </div>
                <div class="tour-search-row">
                    <div class="tour-search-wrapper">
                        <span class="bx bx-search tour-search-icon"></span>
                        <input type="text" id="searchInput" class="tour-search-input" placeholder="Tìm kiếm tên giải hoặc kỳ thủ..." onkeyup="searchTable()">
                    </div>
                    <label class="tour-switch-container">
                        <span class="tour-switch">
                            <input type="checkbox" id="premiumToggle" checked onchange="searchTable()">
                            <span class="tour-slider"></span>
                        </span>
                        <span>Hiện Premium Badge</span>
                    </label>
                    <div id="loading-status" class="loading-status-badge">
                        <span id="statusIcon" class="bx bx-dots-horizontal-rounded" style="color:var(--primary-warning)"></span>
                        <span id="current-tournament">0</span>/${tournamentIds.length} giải
                    </div>
                </div>
            </div>
            <div class="table">
                <table class="styled-table" id="tournament-results-table">
                    <thead><tr><th class="name-tour">Giải đấu</th><th class="organization-day">Thời gian bắt đầu</th><th class="rules">Thể lệ</th><th class="players">Kỳ thủ</th>
                    <th class="winner">🥇 Top 1</th><th class="winner">🥈 Top 2</th><th class="winner">🥉 Top 3</th><th class="winner">🎖️ Top 4</th><th class="winner">🏅 Top 5</th><th class="winner">⭐ Top 6</th></tr></thead>
                    <tbody id="tournament-tbody"><tr class="not-match" style="display:none"><td style="color:var(--color-warning)">Không tìm thấy kết quả nào!</td></tr></tbody>
                </table>
            </div>
            <br><br><hr>`;

        if (typeof window.loadTournamentFiltersFromURL === 'function') {
            window.loadTournamentFiltersFromURL();
        }

        const tbody = document.getElementById('tournament-tbody');
        const skeletonRows = createSkeletonRows(tournamentIds.length);
        skeletonRows.forEach(row => tbody.appendChild(row));

        let successCount = 0;

        await Promise.allSettled(tournamentIds.map(async (id, idx) => {
            if (!Cache.get(`t_${id}`)) {
                await new Promise(r => setTimeout(r, (idx % CONFIG.MAX_CONCURRENT) * 100));
            }

            try {
                const tourData = await getTour(id);
                if (!tourData) return;

                const { rounds, rules, setup, timeControl, timeClass, registeredCount, startTime, endTime } = getTournamentData(tourData);

                // Fetch round data and build points map
                let pointsMap = new Map();
                if (rounds > 0) {
                    const roundData = await fetchRetry(`${CONFIG.CHESS_COM_BASE}/tournament/${id}/${rounds}`);
                    const groups = roundData?.groups || [];
                    const playerList = groups.length 
                        ? (await Promise.allSettled(groups.map(url => fetchRetry(url))))
                            .filter(r => r.status === 'fulfilled')
                            .flatMap(r => r.value?.players || [])
                        : (roundData?.players || []);
                    
                    playerList.forEach(p => {
                        if (p.username) pointsMap.set(p.username.toLowerCase(), p.points || 0);
                    });
                }

                // Process player rankings
                const players = (tourData.players || [])
                    .map(p => ({
                        username: typeof p === 'string' ? p : p.username,
                        points: p.points ?? pointsMap.get((typeof p === 'string' ? p : p.username).toLowerCase()) ?? 0,
                        rank: p.rank || p.place_finish
                    }))
                    .sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity) || b.points - a.points);

                const topPlayers = players.slice(0, CONFIG.MAX_PLAYERS);
                await Promise.allSettled(topPlayers.map(p => getPlayer(p.username)));

                // Determine variant
                let variant = rules;
                if ((rules === 'standard' || rules === 'chess') && setup) {
                    variant = 'custom';
                }

                const formatStr = rounds === 1 
                    ? ` Đấu trường Arena ${calculateDuration(startTime, endTime)}`
                    : ` Hệ Thụy Sĩ ${rounds} vòng`;

                // Build row HTML
                let rowHtml = `<td><a href="${tourData.url}" target="_blank">${tourData.name}</a></td>
                    <td>${formatDate(startTime)}</td>
                    <td>${formatTimeControl(parseTimeControl(timeControl), timeClass)}${formatVariantLink(variant, setup)}${formatStr}</td>
                    <td>${registeredCount}</td>`;

                for (let i = 0; i < CONFIG.MAX_PLAYERS; i++) {
                    rowHtml += await renderPlayer(topPlayers[i]?.username, topPlayers[i]?.points || 0);
                }

                // Update skeleton row
                const row = skeletonRows[idx];
                row.innerHTML = rowHtml;
                row.setAttribute('data-start-time', startTime || 0);
                row.setAttribute('data-players-count', registeredCount);
                row.setAttribute('data-time-class', timeClass || 'classical');
                row.setAttribute('data-variant', variant.toLowerCase());
                row.setAttribute('data-format', rounds === 1 ? 'arena' : 'swiss');
                row.className = '';

                document.getElementById('current-tournament').textContent = ++successCount;

                if (typeof window.searchTable === 'function') {
                    window.searchTable();
                }
            } catch (e) {
                console.error('Error processing tournament:', e);
            }
        }));

        // Update status
        const statusIcon = document.getElementById('statusIcon');
        const isComplete = successCount === tournamentIds.length;
        statusIcon.style.color = isComplete ? 'var(--primary-success)' : 'var(--color-danger)';
        statusIcon.className = isComplete ? 'bx bx-check' : 'bx bx-x';

        // Event delegation for modal and custom variant links
        const modal = document.getElementById('scoreModal');
        if (modal) {
            modal.addEventListener('click', e => {
                if (e.target.id === 'scoreModal') ModalManager.close();
            });
        }

        tbody.addEventListener('click', e => {
            const link = e.target.closest('.custom-variant-link');
            if (link) {
                const setup = link.dataset.setup;
                ModalManager.show(
                    'Thế cờ ban đầu',
                    `<div class="calendar-wrapper" style="padding: 20px; color: var(--neutral-100); word-break: break-all;"><a href="https://lichess.org/analysis/${setup}" target="_blank">${setup}</a></div>`
                );
            }
        });
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('[data-fetch-tournament]').forEach(container => {
                init(container.dataset.fetchTournament, container.id);
            });
        });
    } else {
        document.querySelectorAll('[data-fetch-tournament]').forEach(container => {
            init(container.dataset.fetchTournament, container.id);
        });
    }

    window.TournamentModalManager = ModalManager;
})();
