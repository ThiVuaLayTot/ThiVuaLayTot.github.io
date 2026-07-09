/**
 * @file CTTQ Tournament Fetcher
 * @description Fetches and aggregates CTTQ (Chiến Trường Thí Quân) tournament data into a unified table.
 */

/** @type {Object} API endpoint configurations */
const AGGREGATED_API = {
    CHESS_COM: 'https://api.chess.com/pub',
    MONTHS_GIST: 'https://gist.githubusercontent.com/M-DinhHoangViet/0ae047855007aacfc63886f9d60bc03d/raw',
    TOURNAMENTS_GIST: 'https://gist.githubusercontent.com/M-DinhHoangViet/9c53a11fca709a656076bf6de7c118b0/raw'
};

/** @type {Object} General configuration constants */
const AGGREGATED_CONFIG = {
    MAX_CONCURRENT_REQUESTS: 10,
    TOP_PLAYERS_COUNT: 6,
    DEFAULT_AVATAR: 'https://chess.com/bundles/web/images/user-image.007dad08.svg',
    CACHE_PREFIX: 'cttq_',
    CACHE_TTL: {
        p: 604800000,    // 1 week
        t: 86400000,     // 1 day
        a: 43200000      // 12 hours
    }
};

/** @type {Object} Chess variant metadata and icons */
const AGGREGATED_VARIANTS = {
    'chess960': { name: 'Chess960', url: '/terms/chess960', icon: '/bundles/web/images/variants/live_960_orange.svg' },
    'kingofthehill': { name: 'KOTH', url: '/terms/king-of-the-hill', icon: '/bundles/web/images/variants/koth.svg' },
    'crazyhouse': { name: 'Crazyhouse', url: '/terms/crazyhouse-chess', icon: '/bundles/web/images/variants/crazyhouse.svg' },
    'bughouse': { name: 'Bughouse', url: '/terms/bughouse-chess', icon: '/bundles/web/images/variants/bughouse.svg' },
    'threecheck': { name: '3 Chiếu', url: '/terms/3-check-chess', icon: '/bundles/web/images/variants/3check.svg' },
    'custom': { name: 'Custom', url: '/terms/chess-variants', icon: '/bundles/web/images/variants/custom.svg' }
};

/** @type {Object} Time class icon mapping */
const AGGREGATED_TIME_ICONS = {
    'lightning': { name: 'Bullet', path: '/bundles/web/images/icons/smileys/2x/bullet.png' },
    'bullet': { name: 'Bullet', path: '/bundles/web/images/icons/smileys/2x/bullet.png' },
    'blitz': { name: 'Blitz', path: '/bundles/web/images/icons/smileys/2x/blitz.png' },
    'rapid': { name: 'Rapid', path: '/bundles/web/images/icons/smileys/2x/live.png' },
    'standard': { name: 'Rapid', path: '/bundles/web/images/icons/smileys/2x/live.png' }
};

/**
 * @namespace AggregatedCache
 * @description Integrated caching manager.
 */
const AggregatedCache = {
    memory: new Map(),
    get(key) {
        if (this.memory.has(key)) return this.memory.get(key);
        try {
            const item = JSON.parse(localStorage.getItem(AGGREGATED_CONFIG.CACHE_PREFIX + key));
            if (item && Date.now() < item.exp) {
                this.memory.set(key, item.val);
                return item.val;
            }
            localStorage.removeItem(AGGREGATED_CONFIG.CACHE_PREFIX + key);
        } catch (e) {}
        return null;
    },
    set(key, val, ttl) {
        this.memory.set(key, val);
        try {
            localStorage.setItem(AGGREGATED_CONFIG.CACHE_PREFIX + key, JSON.stringify({ val, exp: Date.now() + ttl }));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                const keys = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (k && k.startsWith(AGGREGATED_CONFIG.CACHE_PREFIX)) keys.push(k);
                }
                keys.forEach(k => localStorage.removeItem(k));
            }
        }
    }
};

/**
 * @namespace AggregatedRequestManager
 * @description Handles rate-limited requests.
 */
const AggregatedRequestManager = {
    active: 0,
    queue: [],
    async acquire() {
        if (this.active >= AGGREGATED_CONFIG.MAX_CONCURRENT_REQUESTS) await new Promise(r => this.queue.push(r));
        this.active++;
    },
    release() {
        this.active--;
        if (this.queue.length) this.queue.shift()();
    },
    async fetch(url, isJson = true) {
        const cached = AggregatedCache.get(url);
        if (cached) return cached;

        await this.acquire();
        try {
            const resp = await fetch(url);
            if (!resp.ok) return null;
            const data = isJson ? await resp.json() : await resp.text();

            if (url.startsWith(AGGREGATED_API.CHESS_COM)) {
                const ttl = url.includes('/player/') ? AGGREGATED_CONFIG.CACHE_TTL.p : AGGREGATED_CONFIG.CACHE_TTL.t;
                AggregatedCache.set(url, data, ttl);
            } else {
                AggregatedCache.memory.set(url, data);
            }
            return data;
        } catch (e) { return null; }
        finally { this.release(); }
    }
};

/**
 * @namespace AggregatedDataProcessor
 * @description Data processing logic.
 */
const AggregatedDataProcessor = {
    calculateDuration(start, end) {
        if (!start || !end) return 'N/A';
        const s = typeof start === 'string' ? new Date(start) : new Date(start * 1000);
        const e = typeof end === 'string' ? new Date(end) : new Date(end * 1000);
        if (isNaN(s) || isNaN(e) || e < s) return 'N/A';
        const diff = e - s;
        const units = [{ n: 'ngày', m: 86400000 }, { n: 'tiếng', m: 3600000 }, { n: 'phút', m: 60000 }, { n: 'giây', m: 1000 }];
        for (const u of units) {
            if (diff >= u.m) {
                const val = Math.floor(diff / u.m);
                const rem = diff % u.m;
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

    async getMonthlyAggregation(monthId, eventType = 'cttq') {
        const cacheKey = `agg_${eventType}_${monthId}`;
        const cached = AggregatedCache.get(cacheKey);
        if (cached) return cached;

        const gistBase = eventType === 'tvlt' ? 'https://gist.githubusercontent.com/M-DinhHoangViet/9c53a11fca709a656076bf6de7c118b0/raw' : AGGREGATED_API.TOURNAMENTS_GIST;
        const text = await AggregatedRequestManager.fetch(`${gistBase}/${monthId}.txt`, false);
        const ids = text ? text.split('\n').filter(l => l.trim()) : [];
        if (!ids.length) return { playerScores: {}, tournaments: [] };

        const tourDataList = await Promise.all(ids.map(id => AggregatedRequestManager.fetch(`${AGGREGATED_API.CHESS_COM}/tournament/${id}`)));
        const playerScores = {}, tournaments = [];

        for (let i = 0; i < ids.length; i++) {
            const data = tourDataList[i];
            if (!data) continue;
            const rounds = data.settings?.total_rounds || data.rounds || data.total_rounds || 0;
            let pointsMap = new Map();
            if (rounds > 0) {
                const roundData = await AggregatedRequestManager.fetch(`${AGGREGATED_API.CHESS_COM}/tournament/${ids[i]}/${rounds}`);
                const groups = roundData?.groups || [];
                const pList = groups.length ? (await Promise.allSettled(groups.map(url => AggregatedRequestManager.fetch(url)))).filter(r => r.status === 'fulfilled').flatMap(r => r.value?.players || []) : (roundData?.players || []);
                pList.forEach(p => p.username && pointsMap.set(p.username.toLowerCase(), p.points || 0));
            }

            const tourPlayers = (data.players || []).map(p => {
                const u = typeof p === 'string' ? p : p.username;
                return { username: u, points: p.points ?? pointsMap.get(u.toLowerCase()) ?? 0 };
            });

            const tc = this.parseTimeControl(data.settings?.time_control || data.time_control || data.timeControl);
            let variant = data.settings?.rules || data.rules || 'standard';
            if (variant === 'standard' && data.settings?.initial_setup) variant = 'custom';

            tournaments.push({
                id: ids[i], name: data.name || 'Unknown', url: data.url || `https://chess.com/tournament/${ids[i]}`,
                variant, timeClass: data.settings?.time_class || data.time_class || 'classical',
                timeControl: tc, totalRounds: rounds, duration: this.calculateDuration(data.start_time || data.startTime, data.finish_time || data.endTime),
                playersCount: data.settings?.registered_user_count || data.players_registered || data.players?.length || 0
            });

            tourPlayers.forEach(p => {
                const u = p.username.toLowerCase();
                if (!playerScores[u]) playerScores[u] = { username: p.username, totalPoints: 0, breakdown: [] };
                playerScores[u].totalPoints += p.points;
                playerScores[u].breakdown.push({ tourName: data.name || 'Unknown', points: p.points, url: data.url });
            });
        }
        const result = { playerScores, tournaments };
        AggregatedCache.set(cacheKey, result, AGGREGATED_CONFIG.CACHE_TTL.a);
        return result;
    }
};

/**
 * @namespace AggregatedRenderer
 * @description UI rendering logic.
 */
const AggregatedRenderer = {
    img: (src, w = 15) => `<img src="${src}" width="${w}" height="${w}" alt="" style="display: inline-block; vertical-align: middle;">`,

    timeFormat(tc, tcClass) {
        const icon = AGGREGATED_TIME_ICONS[tcClass];
        return `${tc} ${icon?.name || 'Standard'} ${icon ? this.img('//chess.com' + icon.path) : ''}`;
    },

    variantInfo(v) {
        const varData = AGGREGATED_VARIANTS[v.toLowerCase()];
        return varData ? { name: varData.name, url: '//chess.com' + varData.url, icon: '//chess.com' + varData.icon } : null;
    },

    async playerCell(player, details) {
        if (!player) return '<td style="color: var(--primary-warning)">Chưa có dữ liệu!</td>';
        const p = details?.player || details || { username: player.username, avatar: AGGREGATED_CONFIG.DEFAULT_AVATAR, status: 'N/A' };
        const badges = {
            'closed:abuse': { c: 'user-badges-closed', i: 'bx bx-dislike', t: 'Closed: Abuse' },
            'closed:fair_play_violations': { c: 'user-badges-closed', i: 'bx bx-block', t: 'Closed: Cheating' },
            'closed': { c: 'user-badges-inactive', i: 'bx bx-no-signal', t: 'Closed: Inactive' },
            'premium': { c: 'user-badges-premium', i: 'bx bxs-star', t: 'Chess.com Membership' }
        }[p.status];
        const badgeHTML = badges ? `<div class="user-badges-component"><div class="user-badges-badge ${badges.c}"><span class="${badges.i}"></span><span>${badges.t}</span></div></div>` : '';
        return `<td><div class="post-user-component"><a class="cc-avatar-component post-user-avatar"><img class="cc-avatar-img" src="${p.avatar || AGGREGATED_CONFIG.DEFAULT_AVATAR}" height="50" width="50" alt="${p.username}"></a>
            <div class="post-user-details"><div class="user-tagline-component"><a class="user-username-component user-tagline-username" href="//chess.com/member/${p.username}" target="_blank">${p.username}</a></div>
            <div class="post-user-status"><span>${badgeHTML}</span><span class="score-pill" data-player='${JSON.stringify(player).replace(/'/g, "&apos;")}'>${player.totalPoints} ĐIỂM</span></div></div></div></td>`;
    },

    async monthRow(monthId, eventType) {
        const { playerScores, tournaments } = await AggregatedDataProcessor.getMonthlyAggregation(monthId, eventType);
        const top = Object.values(playerScores).sort((a, b) => b.totalPoints - a.totalPoints).slice(0, AGGREGATED_CONFIG.TOP_PLAYERS_COUNT);
        const details = await Promise.all(top.map(p => AggregatedRequestManager.fetch(`${AGGREGATED_API.CHESS_COM}/player/${p.username}`)));
        let html = `<tr><td class="name-tour month-clickable" data-tournaments='${JSON.stringify(tournaments).replace(/'/g, "&apos;")}' data-month="${monthId}">Tháng ${monthId} <i class="bx bx-info-circle" style="font-size: 0.8em; opacity: 0.7;"></i></td>
            <td class="organization-day">${tournaments.length} giải đấu</td><td class="players">${Object.keys(playerScores).length}</td>`;
        for (let i = 0; i < AGGREGATED_CONFIG.TOP_PLAYERS_COUNT; i++) html += await this.playerCell(top[i], details[i]);
        return html + '</tr>';
    }
};

/**
 * @namespace AggregatedModalManager
 * @description UI modal management.
 */
const AggregatedModalManager = {
    show(title, content) {
        const m = document.getElementById('scoreModal'), t = document.getElementById('modal-player-name'), b = document.getElementById('modal-score-breakdown');
        if (m && t && b) { t.textContent = title; b.innerHTML = content; m.classList.add('open'); document.body.style.overflow = 'hidden'; }
    },
    close() { const m = document.getElementById('scoreModal'); if (m) { m.classList.remove('open'); document.body.style.overflow = ''; } }
};

/**
 * @namespace AggregatedPageManager
 * @description Page orchestration.
 */
const AggregatedPageManager = {
    async init() {
        const container = document.querySelector('[data-fetch-aggregated]');
        if (!container) return;
        const eventType = container.dataset.fetchAggregated || 'cttq';
        container.innerHTML = '<div class="loading">Đang xử lý dữ liệu...</div>';

        const gistPath = eventType === 'tvlt' ? 'https://gist.githubusercontent.com/M-DinhHoangViet/0ae047855007aacfc63886f9d60bc03d/raw/tvlt.txt' : `${AGGREGATED_API.MONTHS_GIST}/cttq.txt`;
        const text = await AggregatedRequestManager.fetch(gistPath, false);
        const months = text ? text.split('\n').filter(l => l.trim()) : [];
        if (!months.length) { container.innerHTML = '<div class="error">Không tìm thấy dữ liệu.</div>'; return; }

        container.innerHTML = `<input type="text" id="searchInput" class="search-bar" onkeyup="searchTable()" placeholder="Tìm kiếm...">
            <div id="loading-status" style="text-align: center; padding: 20px; font-size: 14px;">Đang xử lý: <span id="statusIcon" class="bx bx-dots-horizontal-rounded" style="color: var(--primary-warning)"></span> <span id="current-tournament">0</span>/${months.length} tháng</div>
            <div class="table"><table class="styled-table" id="tournament-results-table"><thead><tr><th class="name-tour">Tháng</th><th class="organization-day">Thống kê</th><th class="players">Kỳ thủ</th>
            <th class="winner">🥇 Top 1</th><th class="winner">🥈 Top 2</th><th class="winner">🥉 Top 3</th><th class="winner">🎖️ Top 4</th><th class="winner">🏅 Top 5</th><th class="winner">⭐ Top 6</th></tr></thead><tbody id="tournament-tbody"></tbody></table></div>`;

        const tbody = document.getElementById('tournament-tbody');
        const skeletons = months.map(() => { const tr = document.createElement('tr'); tr.innerHTML = Array(9).fill('<td><div class="skeleton"></div></td>').join(''); tbody.appendChild(tr); return tr; });

        let count = 0;
        await Promise.allSettled(months.map(async (m, i) => {
            try {
                const html = await AggregatedRenderer.monthRow(m, eventType);
                const temp = document.createElement('tbody'); temp.innerHTML = html;
                skeletons[i].replaceWith(temp.firstElementChild);
                document.getElementById('current-tournament').textContent = ++count;
            } catch (e) {}
        }));

        const icon = document.getElementById('statusIcon');
        if (icon) { icon.style.color = count === months.length ? 'var(--primary-success)' : 'var(--color-red)'; icon.className = count === months.length ? 'bx bx-check' : 'bx bx-x'; }

        document.getElementById('scoreModal')?.addEventListener('click', e => { if (e.target.id === 'scoreModal') AggregatedModalManager.close(); });
        tbody.addEventListener('click', e => {
            const pill = e.target.closest('.score-pill');
            if (pill) {
                const p = JSON.parse(pill.dataset.player);
                let h = `<div class="calendar-wrapper"><table class="styled-table score-detail-table"><thead><tr><th>Giải đấu</th><th style="text-align: center;">Điểm</th></tr></thead><tbody>`;
                p.breakdown.forEach(item => h += `<tr><td><a href="${item.url}" target="_blank">${item.tourName}</a></td><td style="text-align: center; color: var(--cyan-300);">${item.points}</td></tr>`);
                h += `</tbody><tfoot><tr><td style="text-align: right;">TỔNG CỘNG:</td><td style="text-align: center; color: var(--yellow-400);">${p.totalPoints}</td></tr></tfoot></table></div>`;
                AggregatedModalManager.show(`Chi tiết điểm: ${p.username}`, h);
                return;
            }
            const month = e.target.closest('.month-clickable');
            if (month) {
                const tours = JSON.parse(month.dataset.tournaments);
                let h = `<div class="calendar-wrapper"><table class="styled-table score-detail-table"><thead><tr><th>Vòng đấu</th><th>Thể lệ</th><th style="text-align: center;">Kỳ thủ</th></tr></thead><tbody>`;
                tours.forEach(t => {
                    const v = AggregatedRenderer.variantInfo(t.variant);
                    h += `<tr><td><a href="${t.url}" target="_blank">${t.name}</a></td><td>${AggregatedRenderer.timeFormat(t.timeControl, t.timeClass)}${v ? ` <a href="${v.url}" target="_blank">${v.name} ${AggregatedRenderer.img(v.icon)}</a>` : ''}<br>${t.totalRounds === 1 ? 'Arena' : 'Thụy Sĩ'}</td><td style="text-align: center;">${t.playersCount}</td></tr>`;
                });
                AggregatedModalManager.show(`Chi tiết tháng ${month.dataset.month}`, h + '</tbody></table></div>');
            }
        });
    }
};

if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', () => AggregatedPageManager.init());
else AggregatedPageManager.init();

window.AggregatedModalManager = AggregatedModalManager;
