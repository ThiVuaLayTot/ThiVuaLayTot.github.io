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
        CACHE_TTL: { p: 604800000, t: 86400000, f: 2592000000 },
        DEFAULT_AVATAR: 'https://www.chess.com/bundles/web/images/user-image.007dad08.svg'
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

    // ========== Utility Functions ==========
    function createImg(src, w = 15) {
        return `<img src="${src}" width="${w}" height="${w}" alt="" style="vertical-align:middle">`;
    }

    function formatVariantLink(variant, setup) {
        const config = VARIANTS[variant.toLowerCase()] || { name: variant, url: '/terms', icon: '/bundles/web/images/icons/smileys/2x/board.png' };
        const url = CONFIG.CHESS_COM_URL + config.url;
        const img = createImg(CONFIG.CHESS_COM_URL + config.icon);
        
        if (setup) {
            return `<br><a href="javascript:void(0)" class="custom-variant-link" data-setup="${setup}">${config.name}${img}</a><br>`;
        }
        return `<br><a href="${url}" target="_blank">${config.name} ${img}</a><br>`;
    }

    function formatTimeControl(tc, timeClass) {
        const icon = TIME_ICONS[timeClass];
        const iconHtml = icon ? createImg(CONFIG.CHESS_COM_URL + icon.p) : '';
        return `${tc} ${icon?.name || 'Standard'}${iconHtml}`;
    }

    function formatBadge(status) {
        const badge = BADGE_CONFIG[status];
        if (!badge) return '';
        return `<div class="user-badges-component"><div class="user-badges-badge ${badge.c}"><span class="${badge.i}"></span><span>${badge.t}</span></div></div>`;
    }

    function formatDate(ts) {
        if (!ts) return 'N/A';
        const d = new Date(ts * 1000);
        if (isNaN(d)) return 'N/A';
        const h = String(d.getHours()).padStart(2, '0'), m = String(d.getMinutes()).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0'), mo = String(d.getMonth() + 1).padStart(2, '0'), y = d.getFullYear();
        return `${h}h${m}, ngày ${day}/${mo}/${y}`;
    }

    // ========== Cache System ==========
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

    // ========== Modal Manager ==========
    const ModalManager = {
        show(title, content) {
            const m = document.getElementById('scoreModal'), t = document.getElementById('modal-player-name'), b = document.getElementById('modal-score-breakdown');
            if (m && t && b) { t.textContent = title; b.innerHTML = content; m.classList.add('open'); document.body.style.overflow = 'hidden'; }
        },
        close() { const m = document.getElementById('scoreModal'); if (m) { m.classList.remove('open'); document.body.style.overflow = ''; } }
    };

    // ========== Store Player Data (Global) ==========
    const PLAYER_DATA_STORE = new Map();

    function storePlayerData(username, data) {
        const key = username.toLowerCase();
        if (PLAYER_DATA_STORE.has(key)) {
            const existing = PLAYER_DATA_STORE.get(key);
            existing.avatar = data.avatar || existing.avatar;
            existing.status = data.status || existing.status;
            data.breakdown.forEach(newBk => {
                if (!existing.breakdown.some(item => item.tourName === newBk.tourName && item.url === newBk.url)) {
                    existing.breakdown.push(newBk);
                }
            });
        } else {
            PLAYER_DATA_STORE.set(key, data);
        }
    }

    function getStoredPlayerData(username) {
        return PLAYER_DATA_STORE.get(username.toLowerCase());
    }

    // ========== Event Handlers ==========
    const EventHandlers = {
        handlePlayerClick(username, points) {
            const playerData = getStoredPlayerData(username);
            
            if (!playerData) {
                // Fallback if data not found
                ModalManager.show(username, `<div class="calendar-wrapper" style="padding: 20px;">
                    <div style="text-align: center;">
                        <p>Đang tải dữ liệu...</p>
                    </div>
                </div>`);
                return;
            }

            const { avatar, status, breakdown } = playerData;
            const badgeHtml = formatBadge(status);

            let html = `<div class="calendar-wrapper">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="${avatar || CONFIG.DEFAULT_AVATAR}" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px; border: 2px solid var(--cyan-300);" alt="${username}">
                    <h3 style="margin: 10px 0 5px 0;"><a href="${CONFIG.CHESS_COM_URL}/member/${username}" target="_blank">${username}</a></h3>
                    ${badgeHtml ? `<div style="margin-top: 5px;">${badgeHtml}</div>` : ''}
                </div>

                <table class="styled-table score-detail-table" style="width: 100%;">
                    <thead>
                        <tr>
                            <th>Giải Đấu</th>
                            <th style="text-align: center;">Điểm</th>
                        </tr>
                    </thead>
                    <tbody>`;

            breakdown.forEach(item => {
                html += `<tr>
                    <td><a href="${item.url}" target="_blank" style="color: var(--cyan-300); text-decoration: none;">${item.tourName}</a></td>
                    <td style="text-align: center; color: var(--yellow-400); font-weight: bold;">${item.points}</td>
                </tr>`;
            });

            html += `</tbody>
                    <tfoot>
                        <tr style="border-top: 2px solid var(--cyan-300);">
                            <td style="text-align: right; font-weight: bold;">TỔNG CỘNG:</td>
                            <td style="text-align: center; color: var(--yellow-400); font-weight: bold; font-size: 1.1em;">${points}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>`;

            ModalManager.show(`Chi tiết điểm của ${username}`, html);
        },

        handleCustomVariantClick(setup) {
            ModalManager.show('Thế cờ ban đầu', `<div class="calendar-wrapper" style="padding: 20px; color: var(--neutral-100); word-break: break-all;"><a href="https://lichess.org/analysis/${setup}" target="_blank">${setup}</a></div>`);
        }
    };

    // ========== Fetch & Data Processing ==========
    async function fetchRetry(url, json = true) {
        for (let i = 0; i < 2; i++) {
            try {
                const r = await fetch(url);
                if (r.status === 429) { await new Promise(x => setTimeout(x, 2000)); continue; }
                if (!r.ok) return null;
                return json ? await r.json() : await r.text();
            } catch (e) { if (i === 1) return null; await new Promise(x => setTimeout(x, 1000)); }
        }
    }

    async function getTour(id) {
        const c = Cache.get(`t_${id}`); if (c) return c;
        const d = await fetchRetry(`${CONFIG.CHESS_COM_BASE}/tournament/${id}`);
        if (d) Cache.set(`t_${id}`, d, (d.status === 'finished' || d.tournament?.status === 'finished') ? 'f' : 't');
        return d;
    }

    async function getPlayer(u) {
        const c = Cache.get(`p_${u}`); if (c) return c;
        const d = await fetchRetry(`${CONFIG.CHESS_COM_BASE}/player/${u}`);
        if (d) Cache.set(`p_${u}`, d, 'p');
        return d;
    }

    function calculateDuration(start, end) {
        if (!start || !end) return 'N/A';
        const s = new Date(start * 1000), e = new Date(end * 1000);
        if (isNaN(s) || isNaN(e) || e < s) return 'N/A';
        const diff = e - s;
        const units = [{ n: 'ngày', m: 86400000 }, { n: 'tiếng', m: 3600000 }, { n: 'phút', m: 60000 }, { n: 'giây', m: 1000 }];
        for (const u of units) {
            if (diff >= u.m) {
                const val = Math.floor(diff / u.m), rem = diff % u.m;
                if (u.n === 'tiếng' && rem >= 60000) return `${val} tiếng ${Math.floor(rem / 60000)} phút`;
                return `${val} ${u.n}`;
            }
        }
        return 'N/A';
    }

    function parseTC(tc) {
        if (!tc) return '3+0';
        const m = String(tc).match(/^(\d+)\+(\d+)$/);
        if (m) { const b = parseInt(m[1]), i = parseInt(m[2]); return b >= 60 ? `${Math.floor(b/60)}+${i}` : `${b}+${i}`; }
        const n = parseInt(tc); return !isNaN(n) ? (n >= 60 ? `${Math.floor(n/60)}+0` : `${n}+0`) : '3+0';
    }

    // ========== Render Player Cell ==========
    async function renderPlayer(u, pts, tournamentName, tournamentUrl) {
        if (!u) return '<td style="color:var(--primary-warning)">Giải chưa kết thúc!</td>';
        
        const sp = SPECIAL_PLAYERS.get(u.toLowerCase());
        const specialUsername = sp || u;
        
        const p = await getPlayer(specialUsername);

        // Store in global for modal
        storePlayerData(specialUsername, {
            avatar: p?.avatar || CONFIG.DEFAULT_AVATAR,
            status: p?.status || 'N/A',
            breakdown: [{
                tourName: tournamentName,
                points: pts,
                url: tournamentUrl
            }]
        });

        return `<td class="player-cell clickable-player" data-username="${specialUsername}" data-points="${pts}" style="cursor: pointer;">
            <div class="post-user-component">
                <a class="cc-avatar-component post-user-avatar" href="${CONFIG.CHESS_COM_URL}/member/${specialUsername}" target="_blank"><img class="cc-avatar-img" src="${p?.avatar || CONFIG.DEFAULT_AVATAR}" height="50" width="50" alt="${specialUsername}"></a>
                <div class="post-user-details">
                    <div class="user-tagline-component">
                        <a class="user-username-component user-tagline-username" href="${CONFIG.CHESS_COM_URL}/member/${specialUsername}" target="_blank">${specialUsername}</a>
                    </div>
                    <div class="post-user-status">
                        <span>${formatBadge(p?.status)}</span>
                        <span class="score-display" style="font-weight: bold;">${pts} ĐIỂM</span>
                    </div>
                </div>
            </div>
        </td>`;
    }

    // ========== Main Init ==========
    async function init(type = 'tvlt', containerId = 'tournament-table') {
        const el = document.getElementById(containerId); if (!el) return;
        el.innerHTML = '<div class="loading">Đang xử lý dữ liệu...</div>';

        const txt = await fetchRetry(`${CONFIG.GIST_BASE}/${type}.txt`, false);
        const ids = txt ? txt.split('\n').filter(l => l.trim()) : [];
        if (!ids.length) { el.innerHTML = '<div class="error">Không tìm thấy giải đấu.</div>'; return; }

        el.innerHTML = `
            <div class="filter-group-container" style="margin-bottom: 25px;">
                <!-- Top bar with 4 columns -->
                <div class="tour-top-grid">
                    <div class="tour-dropdown" id="tournament-speed-dropdown">
                        <div class="tour-dropdown-btn" onclick="toggleTourDropdown('tournament-speed-dropdown')">
                            <div class="tour-dropdown-btn-content">
                                <i class="bx bx-time"></i>
                                <span>Thể lệ</span>
                            </div>
                            <span class="bx bx-chevron-down tour-dropdown-arrow"></span>
                        </div>
                        <div class="tour-dropdown-menu" id="timeclass-checkbox-group">
                            <label class="custom-checkbox-container">
                                <input type="checkbox" value="bullet" checked onchange="searchTable()">
                                <span class="checkmark"></span> Bullet (Cờ Siêu chớp)
                            </label>
                            <label class="custom-checkbox-container">
                                <input type="checkbox" value="blitz" checked onchange="searchTable()">
                                <span class="checkmark"></span> Blitz (Cờ chớp)
                            </label>
                            <label class="custom-checkbox-container">
                                <input type="checkbox" value="rapid" checked onchange="searchTable()">
                                <span class="checkmark"></span> Rapid (Cờ Nhanh)
                            </label>
                            <label class="custom-checkbox-container">
                                <input type="checkbox" value="classical" checked onchange="searchTable()">
                                <span class="checkmark"></span> Classical (Cờ chậm)
                            </label>
                        </div>
                    </div>

                    <div class="tour-dropdown" id="tournament-variant-dropdown">
                        <div class="tour-dropdown-btn" onclick="toggleTourDropdown('tournament-variant-dropdown')">
                            <div class="tour-dropdown-btn-content">
                                <i class="bx bxs-chess"></i>
                                <span>Biến thể</span>
                            </div>
                            <span class="bx bx-chevron-down tour-dropdown-arrow"></span>
                        </div>
                        <div class="tour-dropdown-menu" id="variant-checkbox-group">
                            <label class="custom-checkbox-container">
                                <input type="checkbox" value="standard" checked onchange="searchTable()">
                                <span class="checkmark"></span> Cờ tiêu chuẩn
                            </label>
                            <label class="custom-checkbox-container">
                                <input type="checkbox" value="chess960" checked onchange="searchTable()">
                                <span class="checkmark"></span> Chess960
                            </label>
                            <label class="custom-checkbox-container">
                                <input type="checkbox" value="crazyhouse" checked onchange="searchTable()">
                                <span class="checkmark"></span> Crazyhouse
                            </label>
                            <label class="custom-checkbox-container">
                                <input type="checkbox" value="bughouse" checked onchange="searchTable()">
                                <span class="checkmark"></span> Bughouse
                            </label>
                            <label class="custom-checkbox-container">
                                <input type="checkbox" value="kingofthehill" checked onchange="searchTable()">
                                <span class="checkmark"></span> King of the hill
                            </label>
                            <label class="custom-checkbox-container">
                                <input type="checkbox" value="threecheck" checked onchange="searchTable()">
                                <span class="checkmark"></span> 3 Chiếu
                            </label>
                            <label class="custom-checkbox-container">
                                <input type="checkbox" value="custom" checked onchange="searchTable()">
                                <span class="checkmark"></span> Custom Position
                            </label>
                        </div>
                    </div>

                    <div class="tour-dropdown" id="tournament-format-dropdown">
                        <div class="tour-dropdown-btn" onclick="toggleTourDropdown('tournament-format-dropdown')">
                            <div class="tour-dropdown-btn-content">
                                <i class="bx bx-medal"></i>
                                <span>Thể thức</span>
                            </div>
                            <span class="bx bx-chevron-down tour-dropdown-arrow"></span>
                        </div>
                        <div class="tour-dropdown-menu" id="format-checkbox-group">
                            <label class="custom-checkbox-container">
                                <input type="checkbox" value="swiss" checked onchange="searchTable()">
                                <span class="checkmark"></span> Hệ Thụy Sĩ (Swiss)
                            </label>
                            <label class="custom-checkbox-container">
                                <input type="checkbox" value="arena" checked onchange="searchTable()">
                                <span class="checkmark"></span> Đấu trường Arena
                            </label>
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

                <!-- Second bar (Search + Switch + Status Badge) -->
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
                        <span id="current-tournament">0</span>/${ids.length} giải
                    </div>
                </div>
            </div>
            <div class="table"><table class="styled-table" id="tournament-results-table"><thead><tr><th class="name-tour">Giải đấu</th><th class="organization-day">Thời gian bắt đầu</th><th class="rules">Thể lệ</th><th class="players">Kỳ thủ</th>
            <th class="winner">🥇 Top 1</th><th class="winner">🥈 Top 2</th><th class="winner">🥉 Top 3</th><th class="winner">🎖️ Top 4</th><th class="winner">🏅 Top 5</th><th class="winner">⭐ Top 6</th></tr></thead><tbody id="tournament-tbody"><tr class="not-match" style="display:none"><td style="color:var(--color-warning)">Không tìm thấy kết quả nào!</td></tr></tbody></table></div><br><br><hr>`;

        if (typeof window.loadTournamentFiltersFromURL === 'function') {
            window.loadTournamentFiltersFromURL();
        }

        const tbody = document.getElementById('tournament-tbody');
        const skeletons = ids.map(() => {
            const tr = document.createElement('tr'); tr.className = 'skeleton-row';
            let row = `
                <td><div class="skeleton skeleton-text" style="width: 80%;"></div></td>
                <td><div class="skeleton skeleton-text" style="width: 70%;"></div></td>
                <td><div class="skeleton skeleton-text" style="width: 90%;"></div></td>
                <td><div class="skeleton skeleton-text" style="width: 30px; margin: auto;"></div></td>`;
            for (let i = 0; i < CONFIG.MAX_PLAYERS; i++) {
                row += `<td><div class="post-user-component"><div class="skeleton skeleton-avatar"></div>
                    <div class="post-user-details"><div class="skeleton skeleton-text" style="width: 70px;"></div>
                    <div class="skeleton skeleton-text" style="width: 40px;"></div></div></div></td>`;
            }
            tr.innerHTML = row;
            tbody.appendChild(tr); return tr;
        });

        let success = 0;
        await Promise.allSettled(ids.map(async (id, idx) => {
            if (!Cache.get(`t_${id}`)) await new Promise(r => setTimeout(r, (idx % CONFIG.MAX_CONCURRENT) * 100));
            try {
                const data = await getTour(id); if (!data) return;
                const rds = data.settings?.total_rounds || data.rounds || data.total_rounds || 0;
                let ptsMap = new Map();
                if (rds > 0) {
                    const rdData = await fetchRetry(`${CONFIG.CHESS_COM_BASE}/tournament/${id}/${rds}`);
                    const groups = rdData?.groups || [];
                    const pList = groups.length ? (await Promise.allSettled(groups.map(url => fetchRetry(url)))).filter(r => r.status === 'fulfilled').flatMap(r => r.value?.players || []) : (rdData?.players || []);
                    pList.forEach(p => p.username && ptsMap.set(p.username.toLowerCase(), p.points || 0));
                }

                const players = (data.players || []).map(p => {
                    const u = typeof p === 'string' ? p : p.username;
                    return { u, pts: p.points ?? ptsMap.get(u.toLowerCase()) ?? 0, rank: p.rank || p.place_finish };
                }).sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity) || b.pts - a.pts);

                const top = players.slice(0, CONFIG.MAX_PLAYERS);
                await Promise.allSettled(top.map(p => getPlayer(SPECIAL_PLAYERS.get(p.u.toLowerCase()) || p.u)));

                let v = data.settings?.rules || data.rules || 'standard';
                const s = data.settings?.initial_setup || null;
                if ((v === 'standard' || v === 'chess') && s) v = 'custom';

                const fmtStr = rds === 1 ? ` Đấu trường Arena ${calculateDuration(data.start_time || data.startTime, data.finish_time || data.endTime)}` : ` Hệ Thụy Sĩ ${rds} vòng`;

                let row = `<td><a href="${data.url}" target="_blank">${data.name}</a></td>
                    <td>${formatDate(data.start_time || data.startTime)}</td>
                    <td>${formatTimeControl(parseTC(data.settings?.time_control || data.time_control || data.timeControl), data.settings?.time_class || data.time_class)}${formatVariantLink(v, s)}${fmtStr}</td>
                    <td>${data.settings?.registered_user_count || data.players_registered || data.players?.length || 0}</td>`;

                for (let i = 0; i < CONFIG.MAX_PLAYERS; i++) {
                    row += await renderPlayer(top[i]?.u, top[i]?.pts || 0, data.name, data.url);
                }

                skeletons[idx].innerHTML = row;
                skeletons[idx].setAttribute('data-start-time', data.start_time || data.startTime || 0);
                skeletons[idx].setAttribute('data-players-count', data.settings?.registered_user_count || data.players_registered || data.players?.length || 0);
                skeletons[idx].setAttribute('data-time-class', data.settings?.time_class || data.time_class || 'classical');
                skeletons[idx].setAttribute('data-variant', v.toLowerCase());
                skeletons[idx].setAttribute('data-format', rds === 1 ? 'arena' : 'swiss');
                skeletons[idx].className = '';
                document.getElementById('current-tournament').textContent = ++success;

                if (typeof window.searchTable === 'function') {
                    window.searchTable();
                }
            } catch (e) {}
        }));

        const icon = document.getElementById('statusIcon');
        if (icon) { icon.style.color = success === ids.length ? 'var(--primary-success)' : 'var(--color-danger)'; icon.className = success === ids.length ? 'bx bx-check' : 'bx bx-x'; }

        // ========== Setup Event Listeners ==========
        document.getElementById('scoreModal')?.addEventListener('click', e => { 
            if (e.target.id === 'scoreModal') ModalManager.close(); 
        });

        tbody.addEventListener('click', e => {
            // NEW: Click on player cell
            const playerCell = e.target.closest('.clickable-player');
            if (playerCell) {
                const username = playerCell.dataset.username;
                const points = playerCell.dataset.points;
                EventHandlers.handlePlayerClick(username, points);
                return;
            }

            // Existing: Custom variant link
            const link = e.target.closest('.custom-variant-link');
            if (link) {
                const setup = link.dataset.setup;
                EventHandlers.handleCustomVariantClick(setup);
            }
        });
    }

    if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', () => document.querySelectorAll('[data-fetch-tournament]').forEach(c => init(c.dataset.fetchTournament, c.id)));
    else document.querySelectorAll('[data-fetch-tournament]').forEach(c => init(c.dataset.fetchTournament, c.id));

    window.TournamentModalManager = ModalManager;
})();