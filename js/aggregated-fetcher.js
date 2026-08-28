/**
 * @file CTTQ/TVLT Aggregated Tournament Fetcher
 * @description Fetches and aggregates monthly tournament data.
 */

(function() {
    const API = {
        CHESS_COM: 'https://api.chess.com/pub',
        GIST: 'https://gist.githubusercontent.com/M-DinhHoangViet/9c53a11fca709a656076bf6de7c118b0/raw'
    };

    const CONFIG = {
        MAX_CONCURRENT: 10,
        TOP_PLAYERS: 6,
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

    function formatDate(ts) {
        if (!ts) return 'N/A';
        const d = new Date(ts * 1000);
        if (isNaN(d)) return 'N/A';
        const h = String(d.getHours()).padStart(2, '0'), m = String(d.getMinutes()).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0'), mo = String(d.getMonth() + 1).padStart(2, '0'), y = d.getFullYear();
        return `${h}:${m}, ngày ${day}/${mo}/${y}`;
    }

    const Cache = {
        memory: new Map(),
        get(key) {
            if (this.memory.has(key)) return this.memory.get(key);
            try {
                const item = JSON.parse(localStorage.getItem(CONFIG.CACHE_PREFIX + key));
                if (item && Date.now() < item.exp) {
                    this.memory.set(key, item.val);
                    return item.val;
                }
                localStorage.removeItem(CONFIG.CACHE_PREFIX + key);
            } catch (e) {}
            return null;
        },
        set(key, val, ttl) {
            this.memory.set(key, val);
            try {
                localStorage.setItem(CONFIG.CACHE_PREFIX + key, JSON.stringify({ val, exp: Date.now() + ttl }));
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    const keys = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        if (k && k.startsWith(CONFIG.CACHE_PREFIX)) keys.push(k);
                    }
                    keys.forEach(k => localStorage.removeItem(k));
                }
            }
        }
    };

    const RequestManager = {
        active: 0,
        queue: [],
        async acquire() {
            if (this.active >= CONFIG.MAX_CONCURRENT) await new Promise(r => this.queue.push(r));
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
                for (let i = 0; i < 2; i++) {
                    try {
                        const resp = await fetch(url);
                        if (resp.status === 429) { await new Promise(r => setTimeout(r, 2000)); continue; }
                        if (!resp.ok) return null;
                        const data = isJson ? await resp.json() : await resp.text();
                        if (url.startsWith(API.CHESS_COM)) {
                            Cache.set(url, data, url.includes('/player/') ? CONFIG.CACHE_TTL.p : CONFIG.CACHE_TTL.t);
                        } else {
                            Cache.memory.set(url, data);
                        }
                        return data;
                    } catch (e) { if (i === 1) return null; await new Promise(r => setTimeout(r, 1000)); }
                }
            } finally { this.release(); }
        }
    };

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
        calculateDuration(start, end) {
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
        },
        parseTimeControl(tc) {
            if (!tc) return '3+0';
            const match = String(tc).match(/^(\d+)\+(\d+)$/);
            if (match) {
                const b = parseInt(match[1]), i = parseInt(match[2]);
                return b >= 60 ? `${Math.floor(b / 60)}+${i}` : `${b}+${i}`;
            }
            const n = parseInt(tc);
            return !isNaN(n) ? (n >= 60 ? `${Math.floor(n / 60)}+0` : `${n}+0`) : '3+0';
        },
        async getMonthlyAggregation(monthId, eventType) {
            const cacheKey = `agg_v3_${eventType}_${monthId}`;
            const cached = Cache.get(cacheKey);
            if (cached) return cached;

            let ids = [];
            if (DataProcessor.toursByMonth && DataProcessor.toursByMonth[monthId]) {
                ids = DataProcessor.toursByMonth[monthId];
            } else {
                const text = await RequestManager.fetch(`${API.GIST}/${monthId}.txt`, false);
                ids = text ? text.split('\n').filter(l => l.trim()) : [];
            }
            if (!ids.length) return { playerScores: {}, tournaments: [], status: 'finished' };

            const tourDataList = await Promise.all(ids.map(id => RequestManager.fetch(`${API.CHESS_COM}/tournament/${id}`)));
            const playerScores = {}, tournaments = [];
            let monthStatus = 'finished';

            for (let i = 0; i < ids.length; i++) {
                const data = tourDataList[i];
                if (!data) continue;
                const isFinished = (data.status === 'finished' || data.settings?.status === 'finished');
                if (!isFinished) monthStatus = 'unfinished';

                const rounds = data.settings?.total_rounds || data.rounds || data.total_rounds || 0;
                let pointsMap = new Map();
                let roundPlayersMap = new Map();
                if (rounds > 0) {
                    const roundData = await RequestManager.fetch(`${API.CHESS_COM}/tournament/${ids[i]}/${rounds}`);
                    const groups = roundData?.groups || [];
                    const pList = groups.length ? (await Promise.allSettled(groups.map(url => RequestManager.fetch(url)))).filter(r => r.status === 'fulfilled').flatMap(r => r.value?.players || []) : (roundData?.players || []);
                    pList.forEach(p => {
                        if (p.username) {
                            const uLower = p.username.toLowerCase();
                            pointsMap.set(uLower, p.points || 0);
                            roundPlayersMap.set(uLower, { username: p.username, points: p.points || 0 });
                        }
                    });
                }

                const mainPlayers = (data.players || []).map(p => {
                    const u = typeof p === 'string' ? p : p.username;
                    const uLower = u.toLowerCase();
                    return { username: u, points: p.points ?? pointsMap.get(uLower) ?? 0 };
                });

                const tourPlayersMap = new Map();
                roundPlayersMap.forEach((val, key) => {
                    tourPlayersMap.set(key, { username: val.username, points: val.points });
                });
                mainPlayers.forEach(p => {
                    const uLower = p.username.toLowerCase();
                    if (!tourPlayersMap.has(uLower)) {
                        tourPlayersMap.set(uLower, p);
                    } else {
                        const existing = tourPlayersMap.get(uLower);
                        existing.points = Math.max(existing.points, p.points);
                    }
                });
                const tourPlayers = Array.from(tourPlayersMap.values());

                const tc = this.parseTimeControl(data.settings?.time_control || data.time_control || data.timeControl);
                let variant = data.settings?.rules || data.rules || 'standard';
                const setup = data.settings?.initial_setup || null;
                if ((variant === 'standard' || variant === 'chess') && setup) variant = 'custom';

                const calculatedPlayersCount = Math.max(
                    data.settings?.registered_user_count || 0,
                    data.players_registered || 0,
                    tourPlayers.length
                );

                tournaments.push({
                    id: ids[i], name: data.name || 'Unknown', url: data.url || `https://chess.com/tournament/${ids[i]}`,
                    variant, setup, timeClass: data.settings?.time_class || data.time_class || 'classical',
                    timeControl: tc, totalRounds: rounds, duration: this.calculateDuration(data.start_time || data.startTime, data.finish_time || data.endTime),
                    playersCount: calculatedPlayersCount,
                    startTime: data.start_time || data.startTime || 0
                });

                tourPlayers.forEach(p => {
                    const u = p.username.toLowerCase();
                    if (!playerScores[u]) playerScores[u] = { username: p.username, totalPoints: 0, breakdown: [] };
                    playerScores[u].totalPoints += p.points;
                    playerScores[u].breakdown.push({ tourName: data.name || 'Unknown', points: p.points, url: data.url });
                });
            }
            const result = { playerScores, tournaments, status: monthStatus };
            Cache.set(cacheKey, result, CONFIG.CACHE_TTL.a);
            return result;
        }
    };

    const Renderer = {
        img: (src, w = 15) => `<img src="${src}" width="${w}" height="${w}" alt="" style="display: inline-block; vertical-align: middle;">`,
        timeFormat(tc, tcClass) {
            const icon = TIME_ICONS[tcClass];
            return `${tc} ${icon?.name || 'Standard'}${icon ? this.img('https://www.chess.com' + icon.path) : ''}`;
        },
        variantInfo(v) {
            const data = VARIANTS[v.toLowerCase()];
            return data ? { name: data.name, url: 'https://www.chess.com' + data.url, icon: 'https://www.chess.com' + data.icon } : null;
        },
        async playerCell(player, details) {
            if (!player) return '<td style="color: var(--primary-warning)">Chưa có dữ liệu!</td>';
            const p = details?.player || details || { username: player.username, avatar: CONFIG.DEFAULT_AVATAR, status: 'N/A' };
            const badges = {
                'closed:abuse': { c: 'user-badges-closed', i: 'bx bx-dislike', t: 'Bị khóa: Lạm dụng' },
                'closed:fair_play_violations': { c: 'user-badges-closed', i: 'bx bx-block', t: 'Bị khóa: Fair Play' },
                'closed': { c: 'user-badges-inactive', i: 'bx bx-no-signal', t: 'Bị khóa' },
                'premium': { c: 'user-badges-premium', i: 'bx bxs-star', t: 'Premium' }
            }[p.status];
            const badgeHTML = badges ? `<div class="user-badges-component"><div class="user-badges-badge ${badges.c}"><span class="${badges.i}"></span><span>${badges.t}</span></div></div>` : '';
            return `<td><div class="post-user-component"><a class="cc-avatar-component post-user-avatar" href="https://chess.com/member/${p.username}"><img class="cc-avatar-img" src="${p.avatar || CONFIG.DEFAULT_AVATAR}" height="50" width="50" alt="${p.username}"></a>
                <div class="post-user-details"><div class="user-tagline-component"><a class="user-username-component user-tagline-username" href="https://www.chess.com/member/${p.username}" target="_blank">${p.username}</a></div>
                <div class="post-user-status"><span>${badgeHTML}</span><span class="score-pill" data-player='${JSON.stringify(player).replace(/'/g, "&apos;")}'>${player.totalPoints} ĐIỂM</span></div></div></div></td>`;
        },
        async monthRow(monthId, eventType) {
            const { playerScores, tournaments } = await DataProcessor.getMonthlyAggregation(monthId, eventType);
            const top = Object.values(playerScores).sort((a, b) => b.totalPoints - a.totalPoints).slice(0, CONFIG.TOP_PLAYERS);
            const details = await Promise.all(top.map(p => RequestManager.fetch(`${API.CHESS_COM}/player/${p.username}`)));
            let html = `<tr><td class="name-tour month-clickable" data-tournaments='${JSON.stringify(tournaments).replace(/'/g, "&apos;")}' data-month="${monthId}">Tháng ${monthId} <i class="bx bx-info-circle" style="font-size: 0.8em; opacity: 0.7;"></i></td>
                <td class="organization-day month-clickable" data-tournaments='${JSON.stringify(tournaments).replace(/'/g, "&apos;")}' data-month="${monthId}">${tournaments.length} giải đấu <i class="bx bx-info-circle" style="font-size: 0.8em; opacity: 0.7;"></i></td><td class="players">${Object.keys(playerScores).length}</td>`;
            for (let i = 0; i < CONFIG.TOP_PLAYERS; i++) html += await this.playerCell(top[i], details[i]);
            return html + '</tr>';
        }
    };

    const ModalManager = {
        show(title, content) {
            const m = document.getElementById('scoreModal'), t = document.getElementById('modal-player-name'), b = document.getElementById('modal-score-breakdown');
            if (m && t && b) { t.textContent = title; b.innerHTML = content; m.classList.add('open'); document.body.style.overflow = 'hidden'; }
        },
        close() { const m = document.getElementById('scoreModal'); if (m) { m.classList.remove('open'); document.body.style.overflow = ''; } }
    };

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
            if (text && text.includes('*')) {
                const parsed = DataProcessor.parseUnifiedFormat(text);
                months = parsed.months;
                DataProcessor.toursByMonth = parsed.toursByMonth;
            } else if (text) {
                months = text.split('\n').map(l => l.trim()).filter(l => l);
            }

            if (!months.length) { container.innerHTML = '<div class="error">Không tìm thấy dữ liệu.</div>'; return; }

            container.innerHTML = `
                <div class="filter-group-container" style="margin-bottom: 25px;">
                    <!-- Top bar with 3 columns -->
                    <div class="tour-top-grid">
                        <!-- Column 1: Sắp xếp -->
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

                        <!-- Column 2: Status/Type -->
                        <div class="tour-select-container" style="grid-column: span 2;">
                            <select id="cttq-status-filter" class="tour-select-btn" onchange="searchTable()">
                                <option value="all">Tất cả trạng thái</option>
                                <option value="finished">Đã hoàn thành</option>
                                <option value="unfinished">Chưa hoàn thành</option>
                            </select>
                        </div>
                    </div>

                    <!-- Second bar (Search + Switch + Status Badge) -->
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
                <div class="table"><table class="styled-table" id="tournament-results-table"><thead><tr><th class="name-tour">Tháng</th><th class="organization-day">Thống kê</th><th class="players">Kỳ thủ</th>
                <th class="winner">🥇 Top 1</th><th class="winner">🥈 Top 2</th><th class="winner">🥉 Top 3</th><th class="winner">🎖️ Top 4</th><th class="winner">🏅 Top 5</th><th class="winner">⭐ Top 6</th></tr></thead><tbody id="tournament-tbody"><tr class="not-match" style="display: none"><td style="color: var(--color-warning)">Không tìm thấy kết quả nào!</td></tr></tbody></table></div>`;

            if (typeof window.loadTournamentFiltersFromURL === 'function') {
                window.loadTournamentFiltersFromURL();
            }

            const tbody = document.getElementById('tournament-tbody');
            const skeletons = months.map(() => {
                const tr = document.createElement('tr'); tr.className = 'skeleton-row';
                let row = `
                    <td><div class="skeleton skeleton-text" style="width: 80%;"></div></td>
                    <td><div class="skeleton skeleton-text" style="width: 60%;"></div></td>
                    <td><div class="skeleton skeleton-text" style="width: 30px; margin: auto;"></div></td>`;
                for (let i = 0; i < CONFIG.TOP_PLAYERS; i++) {
                    row += `<td><div class="post-user-component"><div class="skeleton skeleton-avatar"></div>
                        <div class="post-user-details"><div class="skeleton skeleton-text" style="width: 70px;"></div>
                        <div class="skeleton skeleton-text" style="width: 40px;"></div></div></div></td>`;
                }
                tr.innerHTML = row;
                tbody.appendChild(tr); return tr;
            });

            // Set up event listeners early so users can click loaded months while remaining months load
            document.getElementById('scoreModal')?.addEventListener('click', e => {
                if (e.target.id === 'scoreModal') ModalManager.close();
                const customLink = e.target.closest('.custom-variant-link');
                if (customLink) {
                    const setup = customLink.dataset.setup;
                    ModalManager.show('Thế cờ ban đầu', `<div class="calendar-wrapper" style="padding: 20px; color: var(--neutral-100); word-break: break-all;">${setup}</div>`);
                }
            });
            tbody.addEventListener('click', e => {
                const pill = e.target.closest('.score-pill');
                if (pill) {
                    const p = JSON.parse(pill.dataset.player);
                    let h = `<div class="calendar-wrapper"><table class="styled-table score-detail-table"><thead><tr><th>Giải đấu</th><th style="text-align: center;">Điểm</th></tr></thead><tbody>`;
                    p.breakdown.forEach(item => h += `<tr><td><a href="${item.url}" target="_blank">${item.tourName}</a></td><td style="text-align: center; color: var(--cyan-300);">${item.points}</td></tr>`);
                    h += `</tbody><tfoot><tr><td style="text-align: right;">TỔNG CỘNG:</td><td style="text-align: center; color: var(--yellow-400);">${p.totalPoints}</td></tr></tfoot></table></div>`;
                    ModalManager.show(`Chi tiết điểm của ${p.username}`, h);
                    return;
                }
                const month = e.target.closest('.month-clickable');
                if (month) {
                    const tours = JSON.parse(month.dataset.tournaments);
                    let h = `<div class="calendar-wrapper"><table class="styled-table score-detail-table"><thead><tr><th>Vòng đấu</th><th>Thời gian bắt đầu</th><th>Thể lệ</th><th style="text-align: center;">Kỳ thủ</th></tr></thead><tbody>`;
                    tours.forEach(t => {
                        const v = Renderer.variantInfo(t.variant);
                        const variantHTML = v ? (t.setup ? ` <a href="javascript:void(0)" class="custom-variant-link" data-setup="${t.setup}">${v.name}${Renderer.img(v.icon)}</a>` : ` <a href="${v.url}" target="_blank">${v.name} ${Renderer.img(v.icon)}</a>`) : '';
                        const formatStr = t.totalRounds === 1 ? `Đấu trường Arena ${t.duration}` : `Hệ Thụy Sĩ ${t.totalRounds} vòng`;
                        const startTimeStr = formatDate(t.startTime);
                        h += `<tr><td><a href="${t.url}" target="_blank">${t.name}</a></td><td>${startTimeStr}</td><td>${Renderer.timeFormat(t.timeControl, t.timeClass)}<br>${variantHTML}<br>${formatStr}</td><td style="text-align: center;">${t.playersCount}</td></tr>`;
                    });
                    ModalManager.show(`Chi tiết tháng ${month.dataset.month}`, h + '</tbody></table></div>');
                }
            });

            let count = 0;
            await Promise.allSettled(months.map(async (m, i) => {
                try {
                    const html = await Renderer.monthRow(m, eventType);
                    const temp = document.createElement('tbody'); temp.innerHTML = html;

                    const newTr = temp.firstElementChild;
                    const { playerScores, tournaments, status } = await DataProcessor.getMonthlyAggregation(m, eventType);
                    const parts = m.split('-');
                    const monthInt = parseInt(parts[0]) - 1;
                    const yearInt = parseInt(parts[1]);
                    const timestamp = new Date(yearInt, monthInt, 1).getTime();

                    newTr.setAttribute('data-start-time', timestamp);
                    newTr.setAttribute('data-players-count', Object.keys(playerScores).length);
                    newTr.setAttribute('data-tours-count', tournaments.length);
                    newTr.setAttribute('data-status', status || 'finished');

                    skeletons[i].replaceWith(newTr);
                    document.getElementById('current-tournament').textContent = ++count;

                    if (typeof window.searchTable === 'function') {
                        window.searchTable();
                    }
                } catch (e) {}
            }));

            const icon = document.getElementById('statusIcon');
            if (icon) { icon.style.color = count === months.length ? 'var(--primary-success)' : 'var(--color-danger)'; icon.className = count === months.length ? 'bx bx-check' : 'bx bx-x'; }
        }
    };

    if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', () => PageManager.init());
    else PageManager.init();

    window.TournamentModalManager = ModalManager;
})();
