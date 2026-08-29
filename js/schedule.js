const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbzQSXlw8AFu70j5-HFos3U21G2QNo190N6aXXxidrflAOfmObC_CH-DF9QuNY4DJY_HCw/exec',
    VIETNAM_OFFSET_MS: 7 * 3600 * 1000,
    EVENT_DURATION_MS: 2 * 60 * 60 * 1000,
    MOBILE_BREAKPOINT: 768,
    MONTH_NAMES: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
    DAY_NAMES_VN: ['Chủ Nhật', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy'],
    INTERNAL_EVENT_TYPES: ["cttq", "tvlt", "cbtt", "dttv"]
};

const ORGANIZER_MAP = {
    'M-DinhHoangViet': '<a href="/leaders#admin3" target="_blank">M-DinhHoangViet</a> (CLB <a href="/leaders" target="_blank">Thí Vua Lấy Tốt</a>)',
    'Mr. TungJohn': '<a href="https://youtube.com/channel/UCvNW1NAWWjblgrP6JQI4MbQ" target="_blank">Mr. TungJohn</a> (CLB <a href="/leaders" target="_blank">Thí Vua Lấy Tốt</a>)',
    'Chess123-2k': '<a href="https://chess.com/member/Chess123-2k" target="_blank">Chess123-2k</a> (CLB <a href="https://link.chess.com/club/0CVQh6" target="_blank">Thí Vua Lấy Tốt</a>)',
    'VN-SenJin': '<a href="/leaders#admin5" target="_blank">VN-SenJin</a> (CLB <a href="/leaders" target="_blank">Thí Vua Lấy Tốt</a>)',
    'FR-CH_TheClanTeamIsMine': '<a href="/leaders#admin2" target="_blank">FR-CH_TheClanTeamIsMine</a> (CLB <a href="/leaders" target="_blank">Thí Vua Lấy Tốt</a>)'
};

const CHESS_TERMS_RULES = [
    { regex: /Đấu trường đa CLB/gi, url: 'https://support.chess.com/articles/8724653-how-can-i-create-a-multi-club-arena' },
    { regex: /Đấu trường Arena/gi, url: 'https://support.chess.com/articles/8562889-what-are-arena-tournaments' },
    { regex: /Hệ Thụy Sĩ/gi, url: 'https://chess.com/terms/swiss-chess' },
    { regex: /King of the Hill/gi, url: 'https://chess.com/terms/king-of-the-hill' },
    { regex: /Crazyhouse/gi, url: 'https://chess.com/terms/crazyhouse' },
    { regex: /Bughouse/gi, url: 'https://chess.com/terms/bughouse' },
    { regex: /Three Check|3 Check|3 chiếu/gi, url: 'https://chess.com/terms/3-check-chess' },
    { regex: /Chess960|960/gi, url: 'https://chess.com/terms/chess960' },
    { regex: /\bKOTH\b/gi, url: 'https://chess.com/terms/king-of-the-hill' },
    { regex: /Daily|Cờ Hàng Ngày|Đấu Hàng Ngày/gi, url: 'https://support.chess.com/articles/8649115-what-are-club-matches' },
    { regex: /Cờ bỏ phiếu/gi, url: 'https://support.chess.com/articles/8614177-how-do-i-play-vote-chess' }
];

const ICON_RULES = [
    { keys: ['blitz'], url: 'icons/smileys/2x/blitz.png' },
    { keys: ['bullet', 'lightning'], url: 'icons/smileys/2x/bullet.png' },
    { keys: ['rapid'], url: 'icons/smileys/2x/live.png' },
    { keys: ['daily', 'ngày', 'nước đi'], url: 'icons/smileys/2x/daily.png' },
    { keys: ['chess960', '960'], url: 'variants/live_960_orange.svg' },
    { keys: ['crazyhouse'], url: 'variants/crazyhouse.svg' },
    { keys: ['bughouse'], url: 'variants/bughouse.svg' },
    { keys: ['king of the hill', 'koth'], url: 'variants/koth.svg' },
    { keys: ['three check', '3 chiếu', '3check'], url: 'variants/3check.svg' }
];

const BANNER_MAP = {
    tvlt: "/images/events/sieu-giai-thi-vua-lay-tot.png",
    cttq: "/images/events/giai-chien-truong-thi-quan.png",
    cbtt: "/images/events/su-kien-co-bi-thi-tot.png",
    dttv: "/images/events/dau-truong-thi-vua.png",
    "club-arena": "https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/VN-SenJin/phpjs58p98gfqbbaDynSFJ.png",
    "multi-club-arena": "https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/VN-SenJin/php4oaq7r23q7n79I3kRE6.png",
    "swiss": "https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/VN-SenJin/phpt9ef43prdg6f80YfkLo.png",
    "vote": "https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/M-DinhHoangViet/php8s3ooliju70kciI1yut.png",
    "daily": "https://images.chesscomfiles.com/uploads/v1/chess_term/f1e3ca50-b739-11ea-a14a-a1c9be904231.1fc2467a.630x354o.73dd2efd0681.png"
};

const INFO_MAP = {
    tvlt: "/events/tvlt-thi-vua-lay-tot",
    cttq: "/events/cttq-chien-truong-thi-quan",
    cbtt: "/events/cbtt-co-bi-thi-tot",
    dttv: "/events/tournaments/dttv",
    "club-arena": "https://support.chess.com/articles/8562889-what-are-arena-tournaments",
    "swiss": "https://chess.com/terms/swiss-chess",
    "vote": "https://support.chess.com/articles/8614177-how-do-i-play-vote-chess",
    "daily": "https://support.chess.com/articles/8649115-what-are-club-matches",
    "multi-club-arena": "https://support.chess.com/articles/8724653-how-can-i-create-a-multi-club-arena"
};

const DOM = {};
const STATE = {
    tournaments: [],
    selectedEvent: null,
    currentView: 'calendar',
    displayYear: undefined,
    displayMonth: undefined
};

function cacheDOMElements() {
    DOM.loadingEl = document.getElementById('loading');
    DOM.errorEl = document.getElementById('error');
    DOM.emptyEl = document.getElementById('empty');
    DOM.lastUpdatedEl = document.getElementById('last-updated');
    DOM.viewSwitcherContainer = document.getElementById('view-switcher-container');
    DOM.scheduleFilers = document.getElementById('schedule-filters');
    DOM.calendarWrapper = document.getElementById('calendar-wrapper');
    DOM.listWrapper = document.getElementById('list-wrapper');
    DOM.calendarBody = document.getElementById('calendar-body');
    DOM.listContainer = document.getElementById('list-container');
    DOM.monthTitle = document.getElementById('month-title');
    DOM.btnPrevMonth = document.getElementById('btn-prev-month');
    DOM.btnNextMonth = document.getElementById('btn-next-month');
    DOM.btnViewCalendar = document.getElementById('btn-view-calendar');
    DOM.btnViewList = document.getElementById('btn-view-list');
    DOM.scheduleSearch = document.getElementById('schedule-search');
    DOM.schedulePrizeFilter = document.getElementById('schedule-prize-filter');
    DOM.scheduleTypeGroup = document.getElementById('schedule-type-group');
    DOM.eventModal = document.getElementById('eventModal');
    DOM.modalName = document.getElementById('modal-name');
    DOM.modalCategory = document.getElementById('modal-category');
    DOM.modalOrganizer = document.getElementById('modal-organizer');
    DOM.modalTime = document.getElementById('modal-time');
    DOM.modalGameRules = document.getElementById('modal-game-rules');
    DOM.modalEventRules = document.getElementById('modal-event-rules');
    DOM.modalLogo = document.getElementById('modal-logo');
    DOM.modalLogoLink = document.getElementById('modal-logo-link');
    DOM.modalBanner = document.getElementById('modal-banner');
    DOM.modalJoinBtn = document.getElementById('modal-join');
    DOM.modalRuleBtn = document.getElementById('modal-rule');
    DOM.modalResultsBtn = document.getElementById('modal-results');
}

function getVietnamNow() {
    const now = new Date();
    const vnTime = new Date(now.getTime() + CONFIG.VIETNAM_OFFSET_MS);
    return vnTime;
}

function getVietnamDateParts(dateStr) {
    if (!dateStr) return { year: 1970, month: 0, date: 1, hours: 0, minutes: 0 };
    let formatted = dateStr.trim().replace(' ', 'T');
    if (!formatted.includes('+') && !formatted.includes('Z')) formatted += '+07:00';
    
    const date = new Date(formatted);
    if (isNaN(date.getTime())) return { year: 1970, month: 0, date: 1, hours: 0, minutes: 0 };
    
    const vnDate = new Date(date.getTime() + CONFIG.VIETNAM_OFFSET_MS);
    return {
        year: vnDate.getUTCFullYear(),
        month: vnDate.getUTCMonth(),
        date: vnDate.getUTCDate(),
        hours: vnDate.getUTCHours(),
        minutes: vnDate.getUTCMinutes()
    };
}

function getDayOfWeekVn(dateStr) {
    const parts = getVietnamDateParts(dateStr);
    const date = new Date(parts.year, parts.month, parts.date);
    return CONFIG.DAY_NAMES_VN[date.getDay()];
}

function padZero(n) {
    return String(n).padStart(2, '0');
}

const parseMarkdownLinks = (() => {
    const cache = new Map();
    return (text) => {
        if (!text || text === 'Chưa có thông tin') return text;
        if (cache.has(text)) return cache.get(text);
        
        const result = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        cache.set(text, result);
        return result;
    };
})();

const linkifyChessTerms = (() => {
    const cache = new Map();
    return (text) => {
        if (!text || text === 'Chưa có thông tin') return text;
        if (cache.has(text)) return cache.get(text);

        const placeholders = [];
        let result = text.replace(/<a\b[^>]*>.*?<\/a>/gi, (match) => {
            placeholders.push(match);
            return `___PH_${placeholders.length - 1}___`;
        });

        CHESS_TERMS_RULES.forEach(({ regex, url }) => {
            result = result.replace(regex, (match) => {
                placeholders.push(`<a href="${url}" target="_blank" class="rule-helper-link">${match}</a>`);
                return `___PH_${placeholders.length - 1}___`;
            });
        });

        for (let i = placeholders.length - 1; i >= 0; i--) {
            result = result.replace(`___PH_${i}___`, placeholders[i]);
        }

        cache.set(text, result);
        return result;
    };
})();

function getGameRulesWithIcon(rulesText) {
    if (!rulesText || rulesText === 'Chưa có thông tin') return rulesText;
    const lower = rulesText.toLowerCase();

    const icons = ICON_RULES
        .filter(rule => rule.keys.some(k => lower.includes(k)))
        .map(rule => {
            const fullUrl = `https://chess.com/bundles/web/images/${rule.url}`;
            return `<img src="${fullUrl}" width="17" height="17" alt="" style="vertical-align:middle;margin-left:4px;">`;
        })
        .join('');

    return rulesText + icons;
}

function getEventBadgesHTML(isCoThuong, isTentative) {
    if (isTentative) {
        if (isCoThuong) {
            return `<span class="badge-schedule badge-prize-combined-premium"><span class="badge-pulse-dot-prize"></span><i class="bx bxs-award"></i> Có thưởng (Dự kiến)</span>`;
        } else {
            return `<span class="badge-schedule badge-combined-premium"><span class="badge-pulse-dot"></span><i class="bx bx-coffee"></i> Giao lưu (Dự kiến)</span>`;
        }
    } else {
        if (isCoThuong) {
            return `<span class="badge-schedule badge-co-thuong"><i class="bx bxs-award"></i> Có thưởng</span>`;
        } else {
            return `<span class="badge-schedule badge-giao-luu"><i class="bx bx-coffee"></i> Giao lưu</span>`;
        }
    }
}

function isPrizeEvent(tournament) {
    const prize = (tournament.prize || '').toLowerCase().trim();
    return prize !== '' && prize !== 'giao lưu' && prize !== 'không' && prize !== 'không có';
}

function isTentativeEvent(tournament) {
    return tournament.isTentative === 'Dự kiến' || tournament.isTentative === 'Tentative';
}

function getMappedOrganizer(rawOrganizer) {
    return ORGANIZER_MAP[rawOrganizer] || parseMarkdownLinks(rawOrganizer) || 'Quản trị viên';
}

function getFilterState() {
    return {
        search: (DOM.scheduleSearch?.value || '').toLowerCase().trim(),
        onlyPrize: DOM.schedulePrizeFilter?.checked || false,
        types: Array.from(DOM.scheduleTypeGroup?.querySelectorAll('input[type="checkbox"]:checked') || []).map(cb => cb.value)
    };
}

function matchesFilters(tournament, filters) {
    const eventName = (tournament.eventName || '').toLowerCase();
    const matchesSearch = !filters.search || eventName.includes(filters.search);
    
    let matchesPrize = true;
    if (filters.onlyPrize) {
        matchesPrize = isPrizeEvent(tournament);
    }
    
    const matchesType = filters.types.includes(tournament.eventType);
    
    return matchesSearch && matchesPrize && matchesType;
}

function loadFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('search') && DOM.scheduleSearch) DOM.scheduleSearch.value = params.get('search');
    if (params.has('prize') && DOM.schedulePrizeFilter) DOM.schedulePrizeFilter.checked = (params.get('prize') === '1');
    if (params.has('tc') && DOM.scheduleTypeGroup) {
        const selectedTypes = params.get('tc').toLowerCase().split(/[\s+]+/);
        DOM.scheduleTypeGroup.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = selectedTypes.includes(cb.value.toLowerCase());
        });
    }
}

function saveFiltersToURL() {
    const params = new URLSearchParams();
    const filters = getFilterState();
    if (filters.search) params.set('search', filters.search);
    params.set('prize', DOM.schedulePrizeFilter?.checked ? '1' : '0');
    const allTypes = Array.from(DOM.scheduleTypeGroup?.querySelectorAll('input[type="checkbox"]') || [])
        .map(cb => cb.value);
    if (filters.types.length < allTypes.length && filters.types.length > 0) {
        params.set('tc', filters.types.join(' '));
    }
    const newQuery = params.toString();
    const newURL = window.location.pathname + (newQuery ? '?' + newQuery : '');
    window.history.replaceState(null, '', newURL);
}

function getCalendarDays(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const startDay = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const days = [];

    let prevMonth = month - 1, prevYear = year;
    if (prevMonth < 0) { prevMonth = 11; prevYear--; }
    for (let i = startDay - 1; i >= 0; i--) {
        days.push({ day: daysInPrevMonth - i, month: prevMonth, year: prevYear, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ day: i, month, year, isCurrentMonth: true });
    }

    let nextMonth = month + 1, nextYear = year;
    if (nextMonth > 11) { nextMonth = 0; nextYear++; }
    const totalCells = days.length > 35 ? 42 : 35;
    const remainingDays = totalCells - days.length;
    for (let i = 1; i <= remainingDays; i++) {
        days.push({ day: i, month: nextMonth, year: nextYear, isCurrentMonth: false });
    }

    return days;
}

function renderCalendar() {
    const vnToday = getVietnamNow();
    const year = STATE.displayYear;
    const month = STATE.displayMonth;
    const filters = getFilterState();
    const days = getCalendarDays(year, month);

    if (!DOM.calendarBody) return;
    DOM.calendarBody.innerHTML = '';

    for (let i = 0; i < days.length; i += 7) {
        const tr = document.createElement('tr');
        for (let j = 0; j < 7; j++) {
            const dayObj = days[i + j];
            const td = document.createElement('td');
            if (!dayObj.isCurrentMonth) td.classList.add('other-month');
            if (vnToday.getUTCFullYear() === dayObj.year &&
                vnToday.getUTCMonth() === dayObj.month &&
                vnToday.getUTCDate() === dayObj.day) {
                td.classList.add('today');
            }

            const dayNum = document.createElement('span');
            dayNum.className = 'day-number';
            dayNum.textContent = dayObj.day;
            td.appendChild(dayNum);

            const eventsDiv = document.createElement('div');
            eventsDiv.className = 'events-container';

            STATE.tournaments
                .filter(t => {
                    const tParts = getVietnamDateParts(t.startTime);
                    return tParts.year === dayObj.year && tParts.month === dayObj.month && tParts.date === dayObj.day;
                })
                .filter(t => matchesFilters(t, filters))
                .forEach(tournament => {
                    const icon = document.createElement('span');
                    icon.className = 'event-icon';
                    if (isTentativeEvent(tournament)) icon.classList.add('tentative');
                    if (isPrizeEvent(tournament)) icon.classList.add('has-prize');
                    const img = document.createElement('img');
                    img.src = tournament.logo || 'https://chess.com/bundles/web/images/image-default.445cb543.svg';
                    img.title = tournament.eventName || 'Tournament';
                    img.onclick = (e) => {
                        e.stopPropagation();
                        openModal(tournament);
                    };
                    icon.appendChild(img);
                    eventsDiv.appendChild(icon);
                });

            td.appendChild(eventsDiv);
            tr.appendChild(td);
        }
        DOM.calendarBody.appendChild(tr);
    }
}

function getSortedEvents() {
    return STATE.tournaments
        .map(t => {
            const tParts = getVietnamDateParts(t.startTime);
            const time = new Date(tParts.year, tParts.month, tParts.date, tParts.hours, tParts.minutes).getTime();
            return { t, time };
        })
        .sort((a, b) => a.time - b.time)
        .map(item => item.t);
}

function renderListView() {
    if (!DOM.listContainer) return;
    DOM.listContainer.innerHTML = '';
    const vnToday = getVietnamNow();
    const year = STATE.displayYear;
    const month = STATE.displayMonth;
    const filters = getFilterState();
    const nowMs = Date.now();
    const currentMonthEvents = getSortedEvents()
        .filter(t => {
            const tParts = getVietnamDateParts(t.startTime);
            return tParts.year === year && tParts.month === month;
        })
        .filter(t => matchesFilters(t, filters));

    if (currentMonthEvents.length === 0) {
        DOM.listContainer.innerHTML = `
            <div class="empty-list-message" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--neutral-500);">
                <i class="bx bx-calendar-x" style="font-size: 3rem; color: var(--cyan-400); margin-bottom: 15px; display: block;"></i>
                <p style="font-size: 1.15rem; font-weight: 500;">Không có sự kiện nào khớp với bộ lọc hiện tại</p>
            </div>`;
        return;
    }

    currentMonthEvents.sort((a, b) => {
        const aHasPrize = isPrizeEvent(a);
        const bHasPrize = isPrizeEvent(b);
        if (aHasPrize && !bHasPrize) return -1;
        if (!aHasPrize && bHasPrize) return 1;
        const aEnded = getEventEndTime(a) < nowMs;
        const bEnded = getEventEndTime(b) < nowMs;
        if (!aEnded && bEnded) return -1;
        if (aEnded && !bEnded) return 1;
        return getEventStartTime(a) - getEventStartTime(b);
    });

    currentMonthEvents.forEach(t => renderEventCard(t, DOM.listContainer));
}

function getEventStartTime(tournament) {
    let formatted = tournament.startTime.trim().replace(' ', 'T');
    if (!formatted.includes('+') && !formatted.includes('Z')) {
        formatted += '+07:00';
    }
    const dateObj = new Date(formatted);
    return isNaN(dateObj.getTime()) ? 0 : dateObj.getTime();
}

function getEventEndTime(tournament) {
    return getEventStartTime(tournament) + CONFIG.EVENT_DURATION_MS;
}

function renderEventCard(tournament, container) {
    const card = document.createElement('div');
    card.className = 'event-list-card';
    const isCoThuong = isPrizeEvent(tournament);
    const isTentative = isTentativeEvent(tournament);
    const categoryHTML = getEventBadgesHTML(isCoThuong, isTentative);
    const tParts = getVietnamDateParts(tournament.startTime);
    const dayVn = getDayOfWeekVn(tournament.startTime);
    const dayPrefix = dayVn === 'Chủ Nhật' ? '' : 'Thứ ';
    let formattedTime = `${dayPrefix}${dayVn}, ${padZero(tParts.date)} thg ${padZero(tParts.month + 1)}, ${tParts.year} lúc ${padZero(tParts.hours)}h${padZero(tParts.minutes)}`;
    if (isTentative) formattedTime = `Dự kiến: ${formattedTime}`;
    const mappedOrganizer = getMappedOrganizer(tournament.organizer || '');
    card.innerHTML = `
        <div class="event-card-header">
            <div class="event-card-logo">
                <img src="${tournament.logo || 'https://chess.com/bundles/web/images/image-default.445cb543.svg'}" alt="Logo">
            </div>
            <div class="event-card-title-group">
                <div class="event-card-badges">${categoryHTML}</div>
                <h3 class="event-card-title">${tournament.eventName || 'Tournament'}</h3>
            </div>
        </div>
        <div class="event-card-details">
            <div class="event-card-detail-item">
                <i class="bx bx-calendar"></i>
                <span><strong>Thời gian:</strong> ${formattedTime}</span>
            </div>
            <div class="event-card-detail-item">
                <i class="bx bx-grid-alt"></i>
                <span><strong>Thể lệ:</strong> ${parseMarkdownLinks(tournament.eventRules || 'Chưa có thông tin')}</span>
            </div>
            <div class="event-card-detail-item">
                <i class="bx bxs-chess"></i>
                <span><strong>Ván đấu:</strong> ${getGameRulesWithIcon(linkifyChessTerms(parseMarkdownLinks(tournament.gameRules || 'Chưa có thông tin')))}</span>
            </div>
            <div class="event-card-detail-item">
                <i class="bx bxs-user-check"></i>
                <span><strong>Tổ chức:</strong> ${mappedOrganizer}</span>
            </div>
        </div>
        <div class="event-card-footer">
            <button class="btn btn-secondary card-detail-btn"><i class="bx bx-info-circle"></i> Chi tiết</button>
            <a href="${tournament.joinLink || '#'}" target="_blank" class="card-join-link">
                <button class="btn btn-primary"><i class="bx bx-user-plus"></i> Tham gia</button>
            </a>
        </div>
    `;

    card.querySelector('.card-detail-btn').onclick = (e) => {
        e.stopPropagation();
        openModal(tournament);
    };
    
    card.onclick = () => openModal(tournament);
    
    card.querySelector('.card-join-link').onclick = function(e) {
        if (!this.href || this.href === '#') {
            e.preventDefault();
            e.stopPropagation();
            alert('Hiện chưa có link giải, hãy hỏi các quản trị viên hoặc người tổ chức giải này để tìm hiểu thêm!');
        }
    };

    container.appendChild(card);
}

function getModalURLs(tournament) {
    const type = tournament.eventType;
    if (CONFIG.INTERNAL_EVENT_TYPES.includes(type)) {
        return {
            bannerUrl: tournament.bannerLink || BANNER_MAP[type],
            newsUrl: tournament.newsLink || INFO_MAP[type],
            resultUrl: `/events/tournaments/${type}`,
            rulesPageUrl: INFO_MAP[type] || "https://support.chess.com"
        };
    } else {
        return {
            bannerUrl: tournament.bannerLink || BANNER_MAP[type] || "https://chess.com/bundles/web/images/404-pawn.f17f262c.gif",
            newsUrl: tournament.newsLink || INFO_MAP[type] || "https://support.chess.com",
            resultUrl: `https://chess.com/clubs/events/thi-vua-lay-tot-tungjohn-playing-chess?clubId=325849&ref_id=89365835&type=${type}`,
            rulesPageUrl: INFO_MAP[type] || "https://support.chess.com"
        };
    }
}

function openModal(tournament) {
    STATE.selectedEvent = tournament;
    const urls = getModalURLs(tournament);
    const isCoThuong = isPrizeEvent(tournament);
    const isTentative = isTentativeEvent(tournament);

    if (tournament.joinLink) {
        DOM.modalName.innerHTML = `<a href="${tournament.joinLink}" target="_blank">${tournament.eventName || 'Chi tiết giải đấu'}</a>`;
    } else {
        DOM.modalName.innerHTML = `<a href="#" onclick="event.preventDefault(); alert('Hiện chưa có link giải, hãy hỏi các quản trị viên hoặc người tổ chức giải này để tìm hiểu thêm!');">${tournament.eventName || 'Chi tiết giải đấu'}</a>`;
    }

    DOM.modalCategory.innerHTML = getEventBadgesHTML(isCoThuong, isTentative);
    DOM.modalOrganizer.innerHTML = getMappedOrganizer(tournament.organizer || '');

    const tParts = getVietnamDateParts(tournament.startTime);
    const dayVn = getDayOfWeekVn(tournament.startTime);
    const dayPrefix = dayVn === 'Chủ Nhật' ? '' : 'Thứ ';
    let formattedTime = `${dayPrefix}${dayVn}, ngày ${padZero(tParts.date)} thg ${padZero(tParts.month + 1)} năm ${tParts.year} lúc ${padZero(tParts.hours)}h${padZero(tParts.minutes)}`;

    let gameRulesText = tournament.gameRules || 'Chưa có thông tin';
    let eventRulesText = tournament.eventRules || 'Chưa có thông tin';

    if (isTentative) {
        formattedTime = `Dự kiến ${formattedTime}`;
        if (gameRulesText !== 'Chưa có thông tin') gameRulesText = `Dự kiến ${gameRulesText}`;
        if (eventRulesText !== 'Chưa có thông tin') eventRulesText = `Dự kiến ${eventRulesText}`;
    }

    DOM.modalTime.innerText = formattedTime;
    DOM.modalGameRules.innerHTML = getGameRulesWithIcon(linkifyChessTerms(parseMarkdownLinks(gameRulesText)));
    DOM.modalEventRules.innerHTML = linkifyChessTerms(parseMarkdownLinks(eventRulesText));
    DOM.modalLogo.src = tournament.logo;
    DOM.modalBanner.src = urls.bannerUrl;
    DOM.modalLogoLink.href = urls.rulesPageUrl;

    DOM.modalJoinBtn.href = tournament.joinLink || '#';
    if (!tournament.joinLink) {
        DOM.modalJoinBtn.onclick = (e) => {
            e.preventDefault();
            alert('Hiện chưa có link giải, hãy hỏi các quản trị viên hoặc người tổ chức giải này để tìm hiểu thêm!');
        };
    }

    DOM.modalRuleBtn.href = urls.newsUrl;
    DOM.modalResultsBtn.href = urls.resultUrl;

    if (DOM.eventModal) {
        DOM.eventModal.classList.add('open');
        DOM.eventModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    if (DOM.eventModal) {
        DOM.eventModal.classList.remove('open');
        DOM.eventModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
    STATE.selectedEvent = null;
}

function updateNavButtonStates() {
    const vnToday = getVietnamNow();
    const realYear = vnToday.getUTCFullYear();
    const realMonth = vnToday.getUTCMonth();
    const currentAbsoluteMonth = realYear * 12 + realMonth;
    const displayAbsoluteMonth = STATE.displayYear * 12 + STATE.displayMonth;

    const canPrevious = displayAbsoluteMonth > currentAbsoluteMonth - 1;
    const canNext = displayAbsoluteMonth < currentAbsoluteMonth + 1;

    if (DOM.btnPrevMonth) {
        DOM.btnPrevMonth.disabled = !canPrevious;
        DOM.btnPrevMonth.style.opacity = canPrevious ? '1' : '0.3';
    }

    if (DOM.btnNextMonth) {
        DOM.btnNextMonth.disabled = !canNext;
        DOM.btnNextMonth.style.opacity = canNext ? '1' : '0.3';
    }
}

function updateViewSwitcherButtons() {
    if (DOM.btnViewCalendar && DOM.btnViewList) {
        if (STATE.currentView === 'calendar') {
            DOM.btnViewCalendar.classList.add('active');
            DOM.btnViewList.classList.remove('active');
        } else {
            DOM.btnViewList.classList.add('active');
            DOM.btnViewCalendar.classList.remove('active');
        }
    }
}

function renderActiveView() {
    if (DOM.calendarWrapper) DOM.calendarWrapper.style.display = 'none';
    if (DOM.listWrapper) DOM.listWrapper.style.display = 'none';
    if (DOM.emptyEl) DOM.emptyEl.style.display = 'none';
    if (STATE.tournaments.length === 0) {
        if (DOM.emptyEl) DOM.emptyEl.style.display = 'block';
        return;
    }
    if (DOM.monthTitle) DOM.monthTitle.textContent = `${CONFIG.MONTH_NAMES[STATE.displayMonth]}/${STATE.displayYear}`;
    updateNavButtonStates();
    if (STATE.currentView === 'calendar') {
        if (DOM.calendarWrapper) DOM.calendarWrapper.style.display = 'block';
        renderCalendar();
    } else {
        if (DOM.listWrapper) DOM.listWrapper.style.display = 'block';
        renderListView();
    }
}

function changeMonth(offset) {
    const vnToday = getVietnamNow();
    const realYear = vnToday.getUTCFullYear();
    const realMonth = vnToday.getUTCMonth();
    const currentAbsoluteMonth = realYear * 12 + realMonth;
    const displayAbsoluteMonth = STATE.displayYear * 12 + STATE.displayMonth;
    const targetAbsoluteMonth = displayAbsoluteMonth + offset;

    if (targetAbsoluteMonth < currentAbsoluteMonth - 1 || targetAbsoluteMonth > currentAbsoluteMonth + 1) return;

    STATE.displayMonth += offset;
    if (STATE.displayMonth < 0) {
        STATE.displayMonth = 11;
        STATE.displayYear--;
    } else if (STATE.displayMonth > 11) {
        STATE.displayMonth = 0;
        STATE.displayYear++;
    }
    renderActiveView();
}

function switchView(view) {
    STATE.currentView = view;
    updateViewSwitcherButtons();
    renderActiveView();
}

function toggleTourDropdown(id) {
    const el = document.getElementById(id);
    if (!el) return;

    document.querySelectorAll('.tour-dropdown').forEach(d => {
        if (d.id !== id) d.classList.remove('open');
    });

    el.classList.toggle('open');
}

function filterSchedule() {
    saveFiltersToURL();
    renderActiveView();
}

async function loadTournaments() {
    try {
        const response = await fetch(CONFIG.API_URL);
        if (!response.ok) {
            throw new Error(`Mã phản hồi từ máy chủ: ${response.status}`);
        }

        let data;
        const text = await response.text();
        try {
            data = JSON.parse(text);
        } catch (e) {
            if (text.trim().startsWith('<')) {
                throw new Error('Máy chủ Google Apps Script trả về trang HTML thay vì dữ liệu JSON. Có thể do dịch vụ tạm thời bị giới hạn hoặc bảo trì. Vui lòng thử lại sau ít phút.');
            } else {
                throw new Error('Dữ liệu phản hồi từ máy chủ không đúng định dạng JSON.');
            }
        }

        const lastUpdatedStr = data.lastUpdated || (data.events?.[0]?.timestamp) || '';
        let formatted = lastUpdatedStr.trim().replace(' ', 'T');
        if (formatted && !formatted.includes('+') && !formatted.includes('Z')) {
            formatted += '+07:00';
        }
        let updateDate = new Date(formatted);
        if (isNaN(updateDate.getTime())) {
            updateDate = new Date();
        }

        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        if (DOM.lastUpdatedEl) {
            DOM.lastUpdatedEl.innerText = updateDate.toLocaleString('vi-VN', options);
        }

        STATE.tournaments = data.events || data.tournaments || [];

        if (DOM.loadingEl) DOM.loadingEl.style.display = 'none';

        if (STATE.tournaments.length === 0) {
            if (DOM.emptyEl) DOM.emptyEl.style.display = 'block';
        } else {
            if (DOM.viewSwitcherContainer) DOM.viewSwitcherContainer.style.display = 'inline-flex';
            if (DOM.scheduleFilers) DOM.scheduleFilers.style.display = 'flex';
            STATE.currentView = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT ? 'list' : 'calendar';
            updateViewSwitcherButtons();
            const vnToday = getVietnamNow();
            STATE.displayYear = vnToday.getUTCFullYear();
            STATE.displayMonth = vnToday.getUTCMonth();
            renderActiveView();
        }
    } catch (error) {
        console.error('Error:', error);
        if (DOM.loadingEl) DOM.loadingEl.style.display = 'none';
        if (DOM.errorEl) {
            DOM.errorEl.style.display = 'block';
            DOM.errorEl.innerHTML = `<div class="error"><i class="bx bx-error-circle"></i> Lỗi: ${error.message}</div>`;
        }
    }
}

function initializeEventListeners() {
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeModal();
    });
    window.addEventListener('click', (event) => {
        if (event.target === DOM.eventModal) closeModal();
    });
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.tour-dropdown')) {
            document.querySelectorAll('.tour-dropdown').forEach(d => d.classList.remove('open'));
        }
    });
    if (DOM.scheduleSearch) DOM.scheduleSearch.addEventListener('input', filterSchedule);
    if (DOM.schedulePrizeFilter) DOM.schedulePrizeFilter.addEventListener('change', filterSchedule);
    if (DOM.scheduleTypeGroup) DOM.scheduleTypeGroup.addEventListener('change', filterSchedule);
    if (DOM.btnViewCalendar) DOM.btnViewCalendar.addEventListener('click', () => switchView('calendar'));
    if (DOM.btnViewList) DOM.btnViewList.addEventListener('click', () => switchView('list'));
    if (DOM.btnPrevMonth) DOM.btnPrevMonth.addEventListener('click', () => changeMonth(-1));
    if (DOM.btnNextMonth) DOM.btnNextMonth.addEventListener('click', () => changeMonth(1));
}

document.addEventListener('DOMContentLoaded', () => {
    cacheDOMElements();
    loadFiltersFromURL();
    loadTournaments();
    initializeEventListeners();
});

window.switchView = switchView;
window.changeMonth = changeMonth;
window.toggleTourDropdown = toggleTourDropdown;
window.filterSchedule = filterSchedule;
window.openModal = openModal;
window.closeModal = closeModal;
window.renderActiveView = renderActiveView;