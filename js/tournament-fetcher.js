/**
 * @file Tournament Data Fetcher
 * @description Fetches and renders chess tournament data from Chess.com API and Gist sources.
 */

(function() {
    const CONFIG = {
        CHESS_COM_BASE: 'https://api.chess.com/pub',
        CHESS_COM_URL: 'https://chess.com',
        GIST_BASE: 'https://gist.githubusercontent.com/M-DinhHoangViet/9c53a11fca709a656076bf6de7c118b0/raw',
        MAX_PLAYERS_DISPLAY: 6,
        MAX_CONCURRENT_REQUESTS: 10,
        CACHE_PREFIX: 'tvlt_',
        CACHE_TTL: { p: 604800000, t: 86400000, f: 2592000000 }
    };

    const SPECIAL_PLAYERS = new Map([
        ['m_dinhhoangviet', { name: 'M-DinhHoangViet' }],
        ['tungjohn_playing_chess', { name: 'M-DinhHoangViet' }],
        ['thangthukquantrong', { name: 'thangthukquantrong' }],
        ['manh_duy', { name: 'ManhDuy19' }]
    ]);

    const VARIANTS = {
        'standard': { name: 'Cờ tiêu chuẩn', url: '/terms/chess', icon: '/bundles/web/images/icons/smileys/2x/board.png' },
        'chess960': { name: 'Chess960', url: '/terms/chess960', icon: '/bundles/web/images/variants/live_960_orange.svg' },
        'kingofthehill': { name: 'KOTH', url: '/terms/king-of-the-hill', icon: '/bundles/web/images/variants/koth.svg' },
        'crazyhouse': { name: 'Crazyhouse', url: '/terms/crazyhouse-chess', icon: '/bundles/web/images/variants/crazyhouse.svg' },
        'bughouse': { name: 'Bughouse', url: '/terms/bughouse-chess', icon: '/bundles/web/images/variants/bughouse.svg' },
        'threecheck': { name: '3 Chiếu', url: '/terms/3-check-chess', icon: '/bundles/web/images/variants/3check.svg' },
        'custom': { name: 'Custom', url: '/terms/chess-variants', icon: '/bundles/web/images/icons/smileys/2x/themes.png' }
    };

    const TIME_CLASS_ICONS = {
        'lightning': { name: 'Bullet', path: '/bundles/web/images/icons/smileys/2x/bullet.png' },
        'bullet': { name: 'Bullet', path: '/bundles/web/images/icons/smileys/2x/bullet.png' },
        'blitz': { name: 'Blitz', path: '/bundles/web/images/icons/smileys/2x/blitz.png' },
        'rapid': { name: 'Rapid', path: '/bundles/web/images/icons/smileys/2x/live.png' },
        'standard': { name: 'Rapid', path: '/bundles/web/images/icons/smileys/2x/live.png' }
    };

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
        set(key, val, type = 't') {
            this.memory.set(key, val);
            try {
                const exp = Date.now() + (CONFIG.CACHE_TTL[type] || CONFIG.CACHE_TTL.t);
                localStorage.setItem(CONFIG.CACHE_PREFIX + key, JSON.stringify({ val, exp }));
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

    const HTML = {
        img: (src, w = 15) => `<img src="${src}" width="${w}" height="${w}" alt="">`,
        variantLink(v, setup = null) {
            const data = VARIANTS[v.toLowerCase()];
            if (!data) return '<br>';
            const title = setup ? ` title="Initial Setup: ${setup}"` : '';
            return ` <a href="${CONFIG.CHESS_COM_URL}${data.url}" target="_blank"${title}>${data.name} ${this.img(CONFIG.CHESS_COM_URL + data.icon)}</a><br>`;
        },
        timeFormat(tc, tcClass) {
            const icon = TIME_CLASS_ICONS[tcClass];
            return `${tc} ${icon?.name || 'Standard'} ${icon ? this.img(CONFIG.CHESS_COM_URL + icon.path) : ''}`;
        },
        badge(status) {
            const badges = {
                'closed:abuse': { c: 'user-badges-closed', i: 'bx bx-dislike', t: 'Closed: Abuse' },
                'closed:fair_play_violations': { c: 'user-badges-closed', i: 'bx bx-block', t: 'Closed: Cheating' },
                'closed': { c: 'user-badges-inactive', i: 'bx bx-no-signal', t: 'Closed: Inactive' },
                'premium': { c: 'user-badges-premium', i: 'bx bxs-star', t: 'Membership' }
            }[status];
            return badges ? `<div class="user-badges-component"><div class="user-badges-badge ${badges.c}"><span class="${badges.i}"></span><span>${badges.t}</span></div></div>` : '';
        }
    };

    async function fetchWithRetry(url, isJson = true) {
        for (let i = 0; i < 2; i++) {
            try {
                const resp = await fetch(url);
                if (resp.status === 429) { await new Promise(r => setTimeout(r, 2000)); continue; }
                if (!resp.ok) return null;
                return isJson ? await resp.json() : await resp.text();
            } catch (e) { if (i === 1) return null; await new Promise(r => setTimeout(r, 1000)); }
        }
    }

    async function getTournamentData(id) {
        const cached = Cache.get(`t_${id}`);
        if (cached) return cached;
        const data = await fetchWithRetry(`${CONFIG.CHESS_COM_BASE}/tournament/${id}`);
        if (data) Cache.set(`t_${id}`, data, (data.status === 'finished' || data.tournament?.status === 'finished') ? 'f' : 't');
        return data;
    }

    async function getPlayerData(u) {
        const cached = Cache.get(`p_${u}`);
        if (cached) return cached;
        const data = await fetchWithRetry(`${CONFIG.CHESS_COM_BASE}/player/${u}`);
        if (data) Cache.set(`p_${u}`, data, 'p');
        return data;
    }

    function parseTimeControl(tc) {
        if (!tc) return '3+0';
        const match = String(tc).match(/^(\d+)\+(\d+)$/);
        if (match) {
            const b = parseInt(match[1]), i = parseInt(match[2]);
            return b >= 60 ? `${Math.floor(b / 60)}+${i}` : `${b}+${i}`;
        }
        const n = parseInt(tc);
        return !isNaN(n) ? (n >= 60 ? `${Math.floor(n / 60)}+0` : `${n}+0`) : '3+0';
    }

    async function generatePlayerCell(username, points) {
        if (!username) return '<td style="color: var(--primary-warning)">Giải chưa kết thúc!</td>';
        const special = SPECIAL_PLAYERS.get(username.toLowerCase());
        if (special) return `<td><a href="${CONFIG.CHESS_COM_URL}/member/${special.name}" target="_top"><strong>${special.name}</strong></a></td>`;

        const p = await getPlayerData(username);
        return `<td><div class="post-user-component"><span class="cc-avatar-component post-user-avatar"><img class="cc-avatar-img" src="${p?.avatar || 'https://chess.com/bundles/web/images/user-image.007dad08.svg'}" height="50" width="50" alt="${username}"></span>
            <div class="post-user-details"><div class="user-tagline-component"><a class="user-username-component user-tagline-username" href="${CONFIG.CHESS_COM_URL}/member/${username}" target="_blank">${username}</a></div>
            <div class="post-user-status"><span>${HTML.badge(p?.status)}</span><span>${points} ĐIỂM</span></div></div></div></td>`;
    }

    async function fetchAndRender(eventType = 'tvlt', containerId = 'tournament-table') {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '<div class="loading">Đang xử lý dữ liệu...</div>';

        const text = await fetchWithRetry(`${CONFIG.GIST_BASE}/${eventType}.txt`, false);
        const ids = text ? text.split('\n').filter(l => l.trim()) : [];
        if (!ids.length) { container.innerHTML = '<div class="error">Không tìm thấy giải đấu.</div>'; return; }

        container.innerHTML = `<input type="text" id="searchInput" class="search-bar" onkeyup="searchTable()" placeholder="Tìm kiếm...">
            <div id="loading-status" style="text-align: center; padding: 20px; font-size: 14px;">Đang hiển thị: <span id="statusIcon" class="bx bx-dots-horizontal-rounded" style="color: var(--primary-warning)"></span> <span id="current-tournament">0</span>/${ids.length} giải đấu</div>
            <div class="table"><table class="styled-table" id="tournament-results-table"><thead><tr><th class="name-tour">Giải đấu</th><th class="organization-day">Thời gian</th><th class="rules">Thể lệ</th><th class="players">Kỳ thủ</th>
            <th class="winner">🥇 Top 1</th><th class="winner">🥈 Top 2</th><th class="winner">🥉 Top 3</th><th class="winner">🎖️ Top 4</th><th class="winner">🏅 Top 5</th><th class="winner">⭐ Top 6</th></tr></thead><tbody id="tournament-tbody"></tbody></table></div><br><br><hr>`;

        const tbody = document.getElementById('tournament-tbody');
        const skeletons = ids.map(() => {
            const tr = document.createElement('tr'); tr.className = 'skeleton-row';
            tr.innerHTML = Array(10).fill('<td><div class="skeleton"></div></td>').join('');
            tbody.appendChild(tr); return tr;
        });

        let successCount = 0;
        await Promise.allSettled(ids.map(async (id, index) => {
            if (!Cache.get(`t_${id}`)) await new Promise(r => setTimeout(r, (index % 10) * 100));
            try {
                const data = await getTournamentData(id);
                if (!data) return;

                const rounds = data.settings?.total_rounds || data.rounds || data.total_rounds || 0;
                let pointsMap = new Map();
                if (rounds > 0) {
                    const roundData = await fetchWithRetry(`${CONFIG.CHESS_COM_BASE}/tournament/${id}/${rounds}`);
                    const groups = roundData?.groups || [];
                    const pList = groups.length ? (await Promise.allSettled(groups.map(url => fetchWithRetry(url)))).filter(r => r.status === 'fulfilled').flatMap(r => r.value?.players || []) : (roundData?.players || []);
                    pList.forEach(p => p.username && pointsMap.set(p.username.toLowerCase(), p.points || 0));
                }

                const allPlayers = (data.players || []).map(p => {
                    const u = typeof p === 'string' ? p : p.username;
                    return { username: u, points: p.points ?? pointsMap.get(u.toLowerCase()) ?? 0, rank: p.rank || p.place_finish };
                }).sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity) || b.points - a.points);

                const top = allPlayers.slice(0, CONFIG.MAX_PLAYERS_DISPLAY);
                await Promise.allSettled(top.map(p => getPlayerData(p.username)));

                let variant = data.settings?.rules || data.rules || 'standard';
                let setup = data.settings?.initial_setup || null;
                if (variant === 'standard' && setup) variant = 'custom';

                let rowHTML = `<td><a href="${data.url}" target="_top">${data.name}</a></td>
                    <td>${new Date((data.start_time || data.startTime) * 1000).toLocaleString('vi-VN')}</td>
                    <td>${HTML.timeFormat(parseTimeControl(data.settings?.time_control || data.time_control || data.timeControl), data.settings?.time_class || data.time_class)}${HTML.variantLink(variant, setup)}${rounds === 1 ? ' Arena' : ' Thụy Sĩ'}</td>
                    <td>${data.settings?.registered_user_count || data.players_registered || data.players?.length || 0}</td>`;

                for (let i = 0; i < CONFIG.MAX_PLAYERS_DISPLAY; i++) rowHTML += await generatePlayerCell(top[i]?.username, top[i]?.points || 0);

                const tr = skeletons[index];
                if (tr) { tr.innerHTML = rowHTML; tr.className = ''; }
                document.getElementById('current-tournament').textContent = ++successCount;
            } catch (e) {}
        }));

        const icon = document.getElementById('statusIcon');
        if (icon) { icon.style.color = successCount === ids.length ? 'var(--primary-success)' : 'var(--color-red)'; icon.className = successCount === ids.length ? 'bx bx-check' : 'bx bx-x'; }
    }

    if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', () => document.querySelectorAll('[data-fetch-tournament]').forEach(c => fetchAndRender(c.dataset.fetchTournament, c.id)));
    else document.querySelectorAll('[data-fetch-tournament]').forEach(c => fetchAndRender(c.dataset.fetchTournament, c.id));
})();
