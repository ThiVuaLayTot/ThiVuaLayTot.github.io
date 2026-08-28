/**
 * @file Event Schedule Manager
 * @description Manages the tournament calendar and event modal for the schedule page.
 */

/** @type {Array} Global tournament data storage */
let tournaments = [];
/** @type {Object|null} Currently selected event for modal display */
let selectedEvent = null;
/** @type {string} Active display view ('calendar' or 'list') */
let currentView = 'calendar';

/** @type {number} Displayed calendar year */
let displayYear;
/** @type {number} Displayed calendar month (0-11) */
let displayMonth;

/** @type {string} Google Apps Script API endpoint */
const API_URL = 'https://script.google.com/macros/s/AKfycbzQSXlw8AFu70j5-HFos3U21G2QNo190N6aXXxidrflAOfmObC_CH-DF9QuNY4DJY_HCw/exec';

/** @type {Object} Mapping of known tournament organizer names to interactive rich HTML links */
const ORGANIZER_MAP = {
    'M-DinhHoangViet': '<a href="/leaders#admin3" target="_blank">M-DinhHoangViet</a> (CLB <a href="/leaders" target="_blank">Thí Vua Lấy Tốt</a>)',
    'Mr. TungJohn': '<a href="https://youtube.com/channel/UCvNW1NAWWjblgrP6JQI4MbQ" target="_blank">Mr. TungJohn</a> (CLB <a href="/leaders" target="_blank">Thí Vua Lấy Tốt</a>)',
    'Chess123-2k': '<a href="https://chess.com/member/Chess123-2k" target="_blank">Chess123-2k</a> (CLB <a href="https://link.chess.com/club/0CVQh6" target="_blank">Thí Vua Lấy Tốt</a>)',
    'VN-SenJin': '<a href="/leaders#admin5" target="_blank">VN-SenJin</a> (CLB <a href="/leaders" target="_blank">Thí Vua Lấy Tốt</a>)',
    'FR-CH_TheClanTeamIsMine': '<a href="/leaders#admin2" target="_blank">FR-CH_TheClanTeamIsMine</a> (CLB <a href="/leaders" target="_blank">Thí Vua Lấy Tốt</a>)'
};

/**
 * Converts markdown style links [Text](URL) to safe HTML anchor tags with target="_blank".
 * @param {string} text - The input text containing potential markdown links.
 * @returns {string} The HTML string with replaced links.
 */
function parseMarkdownLinks(text) {
    if (!text || text === 'Chưa có thông tin') return text;
    return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
}

/**
 * Helper to replace specific chess keywords with HTML anchor links to Chess.com terms.
 * @param {string} text - The input text.
 * @returns {string} Text with keywords wrapped in <a> tags.
 */
function linkifyChessTerms(text) {
    if (!text || text === 'Chưa có thông tin') return text;

    const placeholders = [];
    // Protect existing <a> tags by tokenizing them
    let result = text.replace(/<a\b[^>]*>.*?<\/a>/gi, (match) => {
        placeholders.push(match);
        return `___PLACEHOLDER_${placeholders.length - 1}___`;
    });

    // Define rules mapping terms to their URLs
    const rules = [
        { regex: /Đấu trường đa CLB/gi, url: 'https://support.chess.com/articles/8724653-how-can-i-create-a-multi-club-arena' },
        { regex: /Đấu trường Arena/gi, url: 'https://support.chess.com/articles/8562889-what-are-arena-tournaments' },
        { regex: /Hệ Thụy Sĩ/gi, url: 'https://chess.com/terms/swiss-chess' },
        { regex: /King of the Hill/gi, url: 'https://chess.com/terms/king-of-the-hill' },
        { regex: /Crazyhouse/gi, url: 'https://chess.com/terms/crazyhouse' },
        { regex: /Bughouse/gi, url: 'https://chess.com/terms/bughouse' },
        { regex: /Three Check/gi, url: 'https://chess.com/terms/3-check-chess' },
        { regex: /3 Check/gi, url: 'https://chess.com/terms/3-check-chess' },
        { regex: /3 chiếu/gi, url: 'https://chess.com/terms/3-check-chess' },
        { regex: /Chess960/gi, url: 'https://chess.com/terms/chess960' },
        { regex: /960/gi, url: 'https://chess.com/terms/chess960' },
        { regex: /\bKOTH\b/gi, url: 'https://chess.com/terms/king-of-the-hill' },
        { regex: /Daily/gi, url: 'https://support.chess.com/articles/8649115-what-are-club-matches' },
        { regex: /Cờ Hàng Ngày/gi, url: 'https://support.chess.com/articles/8649115-what-are-club-matches' },
        { regex: /Đấu Hàng Ngày/gi, url: 'https://support.chess.com/articles/8649115-what-are-club-matches' },
        { regex: /Cờ bỏ phiếu/gi, url: 'https://support.chess.com/articles/8614177-how-do-i-play-vote-chess' }
    ];

    // Apply keyword replacements and tokenize them to avoid nested/double replacements
    rules.forEach(({ regex, url }) => {
        result = result.replace(regex, (match) => {
            placeholders.push(`<a href="${url}" target="_blank" class="rule-helper-link">${match}</a>`);
            return `___PLACEHOLDER_${placeholders.length - 1}___`;
        });
    });

    // Restore all placeholders in reverse order
    for (let i = placeholders.length - 1; i >= 0; i--) {
        result = result.replace(`___PLACEHOLDER_${i}___`, placeholders[i]);
    }

    return result;
}

/**
 * Parses any date string and returns its parts in GMT+7 (Vietnam Time)
 * @param {string} dateStr - The date string to parse
 * @returns {Object} Date parts { year, month, date, hours, minutes }
 */
function getVietnamDateParts(dateStr) {
    if (!dateStr) return { year: 1970, month: 0, date: 1, hours: 0, minutes: 0 };
    let formatted = dateStr.trim().replace(' ', 'T');
    if (!formatted.includes('+') && !formatted.includes('Z')) {
        formatted += '+07:00';
    }
    const date = new Date(formatted);
    if (isNaN(date.getTime())) {
        return { year: 1970, month: 0, date: 1, hours: 0, minutes: 0 };
    }
    const vnDate = new Date(date.getTime() + 7 * 3600000);
    return {
        year: vnDate.getUTCFullYear(),
        month: vnDate.getUTCMonth(),
        date: vnDate.getUTCDate(),
        hours: vnDate.getUTCHours(),
        minutes: vnDate.getUTCMinutes()
    };
}

/**
 * Detects chess game type and returns the HTML string with the appropriate icon appended.
 * @param {string} rulesText - The game rules text.
 * @returns {string} The HTML with icon added.
 */
function getGameRulesWithIcon(rulesText) {
    if (!rulesText || rulesText === 'Chưa có thông tin') return rulesText;
    const lower = rulesText.toLowerCase();

    const iconRules = [
        { keys: ['blitz'], url: 'icons/smileys/2x/blitz.png', alt: 'blitz' },
        { keys: ['bullet', 'lightning'], url: 'icons/smileys/2x/bullet.png', alt: 'bullet' },
        { keys: ['rapid'], url: 'icons/smileys/2x/live.png', alt: 'rapid' },
        { keys: ['daily', 'ngày', 'nước đi'], url: 'icons/smileys/2x/daily.png', alt: 'daily' },
        { keys: ['chess960', '960'], url: 'variants/live_960_orange.svg', alt: 'chess960' },
        { keys: ['crazyhouse'], url: 'variants/crazyhouse.svg', alt: 'crazyhouse' },
        { keys: ['bughouse'], url: 'variants/bughouse.svg', alt: 'bughouse' },
        { keys: ['king of the hill', 'koth'], url: 'variants/koth.svg', alt: 'king of the hill' },
        { keys: ['three check', '3 chiếu', '3check'], url: 'variants/3check.svg', alt: 'three check' }
    ];

    const matchedIcons = iconRules
        .filter(rule => rule.keys.some(k => lower.includes(k)))
        .map(rule => {
            const fullUrl = `https://chess.com/bundles/web/images/${rule.url}`;
            return `<img src="${fullUrl}" width="17" height="17" alt="${rule.alt}" style="vertical-align:middle; margin-left: 4px;">`;
        })
        .join('');

    return rulesText + matchedIcons;
}

/**
 * Initialize calendar on DOM content loaded.
 */
window.addEventListener('DOMContentLoaded', () => {
    loadFiltersFromURL();
    loadTournaments();
});

/**
 * Fetches tournament data from the API and updates the UI.
 * @async
 * @returns {Promise<void>}
 */
async function loadTournaments() {
    try {
        const response = await fetch(API_URL);
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
        document.getElementById('last-updated').innerText = updateDate.toLocaleString('vi-VN', options);

        tournaments = data.events || data.tournaments || [];
        document.getElementById('loading').style.display = 'none';

        if (tournaments.length === 0) {
            document.getElementById('empty').style.display = 'block';
        } else {
            // Display switcher container
            const switcherDiv = document.getElementById('view-switcher-container');
            if (switcherDiv) switcherDiv.style.display = 'inline-flex';

            const filtersDiv = document.getElementById('schedule-filters');
            if (filtersDiv) filtersDiv.style.display = 'flex';

            // Set default view based on device width (list for mobile <= 768px, calendar for desktop)
            currentView = window.innerWidth <= 768 ? 'list' : 'calendar';
            updateViewSwitcherButtons();

            // Initialize displayYear and displayMonth with current Vietnam time
            const today = new Date();
            const vnTodayEpoch = today.getTime() + (7 * 3600 * 1000);
            const vnToday = new Date(vnTodayEpoch);
            displayYear = vnToday.getUTCFullYear();
            displayMonth = vnToday.getUTCMonth();

            renderActiveView();
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').innerHTML =
            `<div class="error"><i class="bx bx-error-circle"></i> Lỗi: ${error.message}</div>`;
    }
}

/**
 * Renders the calendar grid based on current month and tournament data.
 */
function renderCalendar() {
    const today = new Date();
    const vnTodayEpoch = today.getTime() + (7 * 3600 * 1000);
    const vnToday = new Date(vnTodayEpoch);

    if (displayYear === undefined || displayMonth === undefined) {
        displayYear = vnToday.getUTCFullYear();
        displayMonth = vnToday.getUTCMonth();
    }
    const year = displayYear;
    const month = displayMonth;

    const searchVal = (document.getElementById('schedule-search')?.value || '').toLowerCase().trim();
    const onlyPrize = document.getElementById('schedule-prize-filter')?.checked || false;
    const checkedTypes = Array.from(document.querySelectorAll('#schedule-type-group input[type="checkbox"]:checked')).map(cb => cb.value);

    const firstDay = new Date(year, month, 1).getDay();
    const startDay = firstDay === 0 ? 6 : firstDay - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth < 0) {
        prevMonth = 11;
        prevYear--;
    }

    for (let i = startDay - 1; i >= 0; i--) {
        days.push({
            day: daysInPrevMonth - i,
            month: prevMonth,
            year: prevYear,
            isCurrentMonth: false
        });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        days.push({
            day: i,
            month: month,
            year: year,
            isCurrentMonth: true
        });
    }

    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 11) {
        nextMonth = 0;
        nextYear++;
    }

    const totalCells = days.length > 35 ? 42 : 35;
    const remainingDays = totalCells - days.length;
    for (let i = 1; i <= remainingDays; i++) {
        days.push({
            day: i,
            month: nextMonth,
            year: nextYear,
            isCurrentMonth: false
        });
    }

    // Render table
    const tbody = document.getElementById('calendar-body');
    tbody.innerHTML = '';

    for (let i = 0; i < days.length; i += 7) {
        const tr = document.createElement('tr');

        for (let j = 0; j < 7; j++) {
            const dayObj = days[i + j];
            const td = document.createElement('td');

            if (!dayObj.isCurrentMonth) {
                td.classList.add('other-month');
            }

            // Check if today
            if (vnToday.getUTCFullYear() === dayObj.year &&
                vnToday.getUTCMonth() === dayObj.month &&
                vnToday.getUTCDate() === dayObj.day) {
                td.classList.add('today');
            }

            // Day number
            const dayNum = document.createElement('span');
            dayNum.className = 'day-number';
            dayNum.textContent = dayObj.day;
            td.appendChild(dayNum);

            // Events container
            const eventsDiv = document.createElement('div');
            eventsDiv.className = 'events-container';

            const dayTournaments = tournaments.filter(t => {
                const tParts = getVietnamDateParts(t.startTime);
                return tParts.year === dayObj.year &&
                    tParts.month === dayObj.month &&
                    tParts.date === dayObj.day;
            });

            dayTournaments.forEach(tournament => {
                // Match Search
                const eventName = (tournament.eventName || '').toLowerCase();
                const matchesSearch = !searchVal || eventName.includes(searchVal);

                // Match Prize
                let matchesPrize = true;
                if (onlyPrize) {
                    const prize = (tournament.prize || '').toLowerCase().trim();
                    matchesPrize = (prize !== '' && prize !== 'giao lưu' && prize !== 'không' && prize !== 'không có');
                }

                // Match Type
                const matchesType = checkedTypes.includes(tournament.eventType);

                if (matchesSearch && matchesPrize && matchesType) {
                    const icon = document.createElement('span');
                    icon.className = 'event-icon';
                    if (tournament.isTentative === 'Dự kiến' || tournament.isTentative === 'Tentative') {
                        icon.classList.add('tentative');
                    }

                    // Check for prize highlight
                    const prize = (tournament.prize || '').toLowerCase().trim();
                    const isCoThuong = (prize !== '' && prize !== 'giao lưu' && prize !== 'không' && prize !== 'không có');
                    if (isCoThuong) {
                        icon.classList.add('has-prize');
                    }

                    const img = document.createElement('img');
                    img.src = tournament.logo || 'https://chess.com/bundles/web/images/image-default.445cb543.svg';
                    img.title = tournament.eventName || 'Tournament';
                    img.onclick = (e) => {
                        e.stopPropagation();
                        openModal(tournament);
                    };

                    icon.appendChild(img);
                    eventsDiv.appendChild(icon);
                }
            });

            td.appendChild(eventsDiv);
            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    }
}

/**
 * Loads filter states from URL query parameters.
 */
function loadFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);

    const searchVal = params.get('search');
    const searchInput = document.getElementById('schedule-search');
    if (searchInput && searchVal !== null) {
        searchInput.value = searchVal;
    }

    const prizeVal = params.get('prize');
    const prizeCheckbox = document.getElementById('schedule-prize-filter');
    if (prizeCheckbox && prizeVal !== null) {
        prizeCheckbox.checked = (prizeVal === '1');
    }

    const tcVal = params.get('tc');
    if (tcVal !== null) {
        const selectedTypes = tcVal.toLowerCase().split(/[\s+]+/);
        const checkboxes = document.querySelectorAll('#schedule-type-group input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.checked = selectedTypes.includes(cb.value.toLowerCase());
        });
    }
}

/**
 * Saves current filter states to the URL query parameters.
 */
function saveFiltersToURL() {
    const params = new URLSearchParams();

    const searchVal = (document.getElementById('schedule-search')?.value || '').trim();
    if (searchVal) {
        params.set('search', searchVal);
    }

    const prizeCheckbox = document.getElementById('schedule-prize-filter');
    if (prizeCheckbox && prizeCheckbox.checked) {
        params.set('prize', '1');
    } else {
        params.set('prize', '0');
    }

    const checkedTypes = Array.from(document.querySelectorAll('#schedule-type-group input[type="checkbox"]:checked')).map(cb => cb.value);
    const allTypes = Array.from(document.querySelectorAll('#schedule-type-group input[type="checkbox"]')).map(cb => cb.value);

    if (checkedTypes.length < allTypes.length) {
        params.set('tc', checkedTypes.join(' '));
    }

    // Update URL without page reload
    const newQuery = params.toString();
    const newURL = window.location.pathname + (newQuery ? '?' + newQuery : '');
    window.history.replaceState(null, '', newURL);
}

/**
 * Toggles visibility of dropdown boxes.
 */
function toggleTourDropdown(id) {
    const el = document.getElementById(id);
    if (!el) return;

    document.querySelectorAll('.tour-dropdown').forEach(d => {
        if (d.id !== id) d.classList.remove('open');
    });

    el.classList.toggle('open');
}

window.addEventListener('click', (e) => {
    if (!e.target.closest('.tour-dropdown')) {
        document.querySelectorAll('.tour-dropdown').forEach(d => d.classList.remove('open'));
    }
});

/**
 * Filter schedule function triggered by input/select changes.
 */
function filterSchedule() {
    saveFiltersToURL();
    renderActiveView();
}

window.filterSchedule = filterSchedule;
window.toggleTourDropdown = toggleTourDropdown;

/**
 * Helper to generate premium badge HTML for schedule events.
 * Handles combined premium state when Giao lưu/Có thưởng and Dự kiến appear together.
 * @param {boolean} isCoThuong
 * @param {boolean} isTentative
 * @returns {string} Safe HTML string of badges
 */
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

/**
 * Opens the event detail modal with tournament information.
 * @param {Object} tournament - The tournament data object.
 */
function openModal(tournament) {
    selectedEvent = tournament;
    const type = tournament.eventType;
    let bannerUrl, newsUrl, resultUrl;

    const internalTypes = ["cttq", "tvlt", "cbtt-superblitz", "dttv"];
    if (internalTypes.includes(type)) {
        const infoMap = {
            tvlt: "/events/tvlt-thi-vua-lay-tot",
            cttq: "/events/cttq-chien-truong-thi-quan",
            cbtt: "/events/cbtt-co-bi-thi-tot",
            dttv: "/events/tournaments/dttv"
        };
        const bannerMap = {
            tvlt: "/images/events/sieu-giai-thi-vua-lay-tot.png",
            cttq: "/images/events/giai-chien-truong-thi-quan.png",
            cbtt: "/images/events/su-kien-co-bi-thi-tot.png",
            dttv: "/images/events/dau-truong-thi-vua.png"
        };
        resultUrl = `/events/tournaments/${type}`;
        bannerUrl = tournament.bannerLink || bannerMap[type];
        newsUrl = tournament.newsLink || infoMap[type];
    } else {
        const bannerMap = {
            "club-arena": "https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/VN-SenJin/phpjs58p98gfqbbaDynSFJ.png",
            "multi-club-arena": "https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/VN-SenJin/php4oaq7r23q7n79I3kRE6.png",
            "swiss": "https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/VN-SenJin/phpt9ef43prdg6f80YfkLo.png",
            "vote": "https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/M-DinhHoangViet/php8s3ooliju70kciI1yut.png",
            "daily": "https://images.chesscomfiles.com/uploads/v1/chess_term/f1e3ca50-b739-11ea-a14a-a1c9be904231.1fc2467a.630x354o.73dd2efd0681.png"
        };
        const detailMap = {
            "club-arena": "https://support.chess.com/articles/8562889-what-are-arena-tournaments",
            "swiss": "https://chess.com/terms/swiss-chess",
            "vote": "https://support.chess.com/articles/8614177-how-do-i-play-vote-chess",
            "daily": "https://support.chess.com/articles/8649115-what-are-club-matches",
            "multi-club-arena": "https://support.chess.com/articles/8724653-how-can-i-create-a-multi-club-arena"
        };
        resultUrl = `https://chess.com/clubs/events/thi-vua-lay-tot-tungjohn-playing-chess?clubId=325849&ref_id=89365835&type=${type}`;
        bannerUrl = tournament.bannerLink || bannerMap[type] || "https://chess.com/bundles/web/images/404-pawn.f17f262c.gif";
        newsUrl = tournament.newsLink || detailMap[type] || "https://support.chess.com";
    }

    if (tournament.joinLink) {
        document.getElementById('modal-name').innerHTML = `<a href="${tournament.joinLink}" target="_blank">${tournament.eventName || 'Chi tiết giải đấu'}</a>`;
    } else {
        document.getElementById('modal-name').innerHTML = `<a href="#" onclick="event.preventDefault(); alert('Hiện chưa có link giải, hãy hỏi các quản trị viên hoặc người tổ chức giải này để tìm hiểu thêm!');">${tournament.eventName || 'Chi tiết giải đấu'}</a>`;
    }

    const defaultRulesMap = {
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
    const rulesPageUrl = defaultRulesMap[type] || "https://support.chess.com";
    const logoLink = document.getElementById('modal-logo-link');
    if (logoLink) {
        logoLink.href = rulesPageUrl;
    }

    // Highlight Có thưởng / Giao lưu / Dự kiến with badge UI
    const prize = (tournament.prize || '').toLowerCase().trim();
    const isCoThuong = (prize && prize !== 'giao lưu' && prize !== 'không' && prize !== 'không có');
    const isTentative = tournament.isTentative === 'Dự kiến' || tournament.isTentative === 'Tentative';

    const categoryHTML = getEventBadgesHTML(isCoThuong, isTentative);
    document.getElementById('modal-category').innerHTML = categoryHTML;

    const rawOrganizer = (tournament.organizer || '').trim();
    let mappedOrganizer = ORGANIZER_MAP[rawOrganizer] || parseMarkdownLinks(rawOrganizer) || 'Quản trị viên';
    document.getElementById('modal-organizer').innerHTML = mappedOrganizer;

    const pad = n => String(n).padStart(2, '0');
    const tParts = getVietnamDateParts(tournament.startTime);
    const dayVn = getDayOfWeekVn(tournament.startTime);
    const dayPrefix = dayVn === 'Chủ Nhật' ? '' : 'Thứ ';
    let formattedTime = `${dayPrefix}${dayVn} - ngày ${pad(tParts.date)}/${pad(tParts.month + 1)}/${tParts.year} lúc ${pad(tParts.hours)}h${pad(tParts.minutes)}`;

    let gameRulesText = tournament.gameRules || 'Chưa có thông tin';
    let eventRulesText = tournament.eventRules || 'Chưa có thông tin';

    if (isTentative) {
        formattedTime = `Dự kiến ${formattedTime}`;
        if (gameRulesText !== 'Chưa có thông tin') gameRulesText = `Dự kiến ${gameRulesText}`;
        if (eventRulesText !== 'Chưa có thông tin') eventRulesText = `Dự kiến ${eventRulesText}`;
    }

    document.getElementById('modal-time').innerText = formattedTime;

    const parsedGameRules = parseMarkdownLinks(gameRulesText);
    const linkifiedGameRules = linkifyChessTerms(parsedGameRules);
    document.getElementById('modal-game-rules').innerHTML = getGameRulesWithIcon(linkifiedGameRules);

    const parsedEventRules = parseMarkdownLinks(eventRulesText);
    const linkifiedEventRules = linkifyChessTerms(parsedEventRules);
    document.getElementById('modal-event-rules').innerHTML = linkifiedEventRules;

    document.getElementById('modal-logo').src = tournament.logo;
    document.getElementById('modal-banner').src = bannerUrl;

    const joinLink = document.getElementById('modal-join');
    const ruleLink = document.getElementById('modal-rule');
    const resultLink = document.getElementById('modal-results');

    resultLink.href = resultUrl || '#';

    if (tournament.joinLink) {
        joinLink.href = tournament.joinLink;
        joinLink.onclick = null;
    } else {
        joinLink.href = '#';
        joinLink.onclick = function(e) {
            e.preventDefault();
            alert('Hiện chưa có link giải, hãy hỏi các quản trị viên hoặc người tổ chức giải này để tìm hiểu thêm!');
            return false;
        };
    }

    ruleLink.href = tournament.newsLink || rulesPageUrl;
    ruleLink.onclick = null;

    const modal = document.getElementById('eventModal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    selectedEvent = tournament;
}

/**
 * Closes the event detail modal.
 */
function closeModal() {
    const modal = document.getElementById('eventModal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    selectedEvent = null;
}

// Event Listeners for closing modal
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeModal();
    }
});

window.onclick = (event) => {
    const modal = document.getElementById('eventModal');
    if (event.target === modal) {
        closeModal();
    }
};

/**
 * Switch between 'calendar' and 'list' views.
 * @param {string} view - The view to switch to.
 */
function switchView(view) {
    currentView = view;
    updateViewSwitcherButtons();
    renderActiveView();
}

/**
 * Update the active status of switcher buttons.
 */
function updateViewSwitcherButtons() {
    const btnCal = document.getElementById('btn-view-calendar');
    const btnList = document.getElementById('btn-view-list');

    if (btnCal && btnList) {
        if (currentView === 'calendar') {
            btnCal.classList.add('active');
            btnList.classList.remove('active');
        } else {
            btnList.classList.add('active');
            btnCal.classList.remove('active');
        }
    }
}

/**
 * Render the active view.
 */
/**
 * Changes display month by offset and updates display.
 * @param {number} offset - Number of months to offset (-1 or 1).
 */
function changeMonth(offset) {
    if (displayYear === undefined || displayMonth === undefined) {
        const today = new Date();
        const vnTodayEpoch = today.getTime() + (7 * 3600 * 1000);
        const vnToday = new Date(vnTodayEpoch);
        displayYear = vnToday.getUTCFullYear();
        displayMonth = vnToday.getUTCMonth();
    }

    const today = new Date();
    const vnTodayEpoch = today.getTime() + (7 * 3600 * 1000);
    const vnToday = new Date(vnTodayEpoch);
    const realYear = vnToday.getUTCFullYear();
    const realMonth = vnToday.getUTCMonth();
    const currentAbsoluteMonth = realYear * 12 + realMonth;

    const displayAbsoluteMonth = displayYear * 12 + displayMonth;
    const targetAbsoluteMonth = displayAbsoluteMonth + offset;

    // Strictly limit navigation to only 1 month before and after the current real month
    if (targetAbsoluteMonth < currentAbsoluteMonth - 1 || targetAbsoluteMonth > currentAbsoluteMonth + 1) {
        return;
    }

    displayMonth += offset;
    if (displayMonth < 0) {
        displayMonth = 11;
        displayYear--;
    } else if (displayMonth > 11) {
        displayMonth = 0;
        displayYear++;
    }

    renderActiveView();
}

/**
 * Updates a navigation button's state and styling.
 * @param {HTMLElement|null} button - The button element.
 * @param {boolean} isDisabled - Whether the button should be disabled.
 */
function updateNavButtonState(button, isDisabled) {
    if (!button) return;
    button.disabled = isDisabled;
    button.style.opacity = isDisabled ? '0.3' : '1';
    button.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
    button.style.pointerEvents = isDisabled ? 'none' : 'auto';
}

function renderActiveView() {
    const calendarWrapper = document.getElementById('calendar-wrapper');
    const listWrapper = document.getElementById('list-wrapper');
    const emptyMsg = document.getElementById('empty');

    if (calendarWrapper) calendarWrapper.style.display = 'none';
    if (listWrapper) listWrapper.style.display = 'none';
    if (emptyMsg) emptyMsg.style.display = 'none';

    if (tournaments.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }

    // Always update header with the currently navigated month
    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    const titleEl = document.getElementById('month-title');
    if (titleEl) {
        titleEl.textContent = `${monthNames[displayMonth]}/${displayYear}`;
    }

    // Enable/Disable navigation buttons based on previous and next month limits
    const today = new Date();
    const vnTodayEpoch = today.getTime() + (7 * 3600 * 1000);
    const vnToday = new Date(vnTodayEpoch);
    const realYear = vnToday.getUTCFullYear();
    const realMonth = vnToday.getUTCMonth();
    const currentAbsoluteMonth = realYear * 12 + realMonth;

    if (displayYear !== undefined && displayMonth !== undefined) {
        const displayAbsoluteMonth = displayYear * 12 + displayMonth;
        const btnPrev = document.getElementById('btn-prev-month');
        const btnNext = document.getElementById('btn-next-month');

        updateNavButtonState(btnPrev, displayAbsoluteMonth <= currentAbsoluteMonth - 1);
        updateNavButtonState(btnNext, displayAbsoluteMonth >= currentAbsoluteMonth + 1);
    }

    if (currentView === 'calendar') {
        if (calendarWrapper) calendarWrapper.style.display = 'block';
        renderCalendar();
    } else {
        if (listWrapper) listWrapper.style.display = 'block';
        renderListView();
    }
}

function getSortedEvents() {
    const mapped = tournaments.map(t => {
        const tParts = getVietnamDateParts(t.startTime);
        const time = new Date(tParts.year, tParts.month, tParts.date, tParts.hours, tParts.minutes).getTime();
        return { t, time };
    });
    mapped.sort((a, b) => a.time - b.time);
    return mapped.map(item => item.t);
}

/**
 * Render the events in list format.
 */
function renderListView() {
    const listContainer = document.getElementById('list-container');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    const today = new Date();
    const vnTodayEpoch = today.getTime() + (7 * 3600 * 1000);
    const vnToday = new Date(vnTodayEpoch);

    if (displayYear === undefined || displayMonth === undefined) {
        displayYear = vnToday.getUTCFullYear();
        displayMonth = vnToday.getUTCMonth();
    }
    const currentYear = displayYear;
    const currentMonth = displayMonth;

    const searchVal = (document.getElementById('schedule-search')?.value || '').toLowerCase().trim();
    const onlyPrize = document.getElementById('schedule-prize-filter')?.checked || false;
    const checkedTypes = Array.from(document.querySelectorAll('#schedule-type-group input[type="checkbox"]:checked')).map(cb => cb.value);

    const currentMonthEvents = getSortedEvents().filter(t => {
        const tParts = getVietnamDateParts(t.startTime);
        return tParts.year === currentYear && tParts.month === currentMonth;
    });

    const filteredEvents = currentMonthEvents.filter(t => {
        const eventName = (t.eventName || '').toLowerCase();
        const matchesSearch = !searchVal || eventName.includes(searchVal);

        let matchesPrize = true;
        if (onlyPrize) {
            const prize = (t.prize || '').toLowerCase().trim();
            matchesPrize = (prize !== '' && prize !== 'giao lưu' && prize !== 'không' && prize !== 'không có');
        }

        const matchesType = checkedTypes.includes(t.eventType);
        return matchesSearch && matchesPrize && matchesType;
    });

    const nowMs = Date.now();
    const EVENT_DURATION = 2 * 60 * 60 * 1000;

    const mappedFiltered = filteredEvents.map(t => {
        const prize = (t.prize || '').toLowerCase().trim();
        const hasPrize = (prize !== '' && prize !== 'giao lưu' && prize !== 'không' && prize !== 'không có');

        let eventTime = 0;
        if (t.startTime) {
            let formatted = t.startTime.trim().replace(' ', 'T');
            if (!formatted.includes('+') && !formatted.includes('Z')) {
                formatted += '+07:00';
            }
            const dateObj = new Date(formatted);
            eventTime = isNaN(dateObj.getTime()) ? 0 : dateObj.getTime();
        }

        const isEnded = nowMs > (eventTime + EVENT_DURATION);

        return { t, hasPrize, isEnded, eventTime };
    });

    mappedFiltered.sort((a, b) => {
        if (a.hasPrize && !b.hasPrize) return -1;
        if (!a.hasPrize && b.hasPrize) return 1;

        if (!a.isEnded && b.isEnded) return -1;
        if (a.isEnded && !b.isEnded) return 1;

        return a.eventTime - b.eventTime;
    });

    const sortedFilteredEvents = mappedFiltered.map(item => item.t);

    if (sortedFilteredEvents.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-list-message" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--neutral-500);">
                <i class="bx bx-calendar-x" style="font-size: 3rem; color: var(--cyan-400); margin-bottom: 15px; display: block;"></i>
                <p style="font-size: 1.15rem; font-weight: 500;">Không có sự kiện nào khớp với bộ lọc hiện tại</p>
            </div>`;
        return;
    }

    sortedFilteredEvents.forEach(t => {
        const card = document.createElement('div');
        card.className = 'event-list-card';

        // Check types of badges
        const prize = (t.prize || '').toLowerCase().trim();
        const isCoThuong = (prize && prize !== 'giao lưu' && prize !== 'không' && prize !== 'không có');
        const isTentative = t.isTentative === 'Dự kiến' || t.isTentative === 'Tentative';

        const categoryHTML = getEventBadgesHTML(isCoThuong, isTentative);

        const pad = n => String(n).padStart(2, '0');
        const tParts = getVietnamDateParts(t.startTime);
        const dayVn = getDayOfWeekVn(t.startTime);
        const dayPrefix = dayVn === 'Chủ Nhật' ? '' : 'Thứ ';
        let formattedTime = `${pad(tParts.hours)}h${pad(tParts.minutes)}, ${dayPrefix}${dayVn} - ngày ${pad(tParts.date)}/${pad(tParts.month + 1)}/${tParts.year}`;

        if (isTentative) {
            formattedTime = `Dự kiến: ${formattedTime}`;
        }

        const rawOrganizer = (t.organizer || '').trim();
        let mappedOrganizer = ORGANIZER_MAP[rawOrganizer] || parseMarkdownLinks(rawOrganizer) || 'Quản trị viên';

        card.innerHTML = `
            <div class="event-card-header">
                <div class="event-card-logo">
                    <img src="${t.logo || 'https://chess.com/bundles/web/images/image-default.445cb543.svg'}" alt="Logo">
                </div>
                <div class="event-card-title-group">
                    <div class="event-card-badges">${categoryHTML}</div>
                    <h3 class="event-card-title">${t.eventName || 'Tournament'}</h3>
                </div>
            </div>
            <div class="event-card-details">
                <div class="event-card-detail-item">
                    <i class="bx bx-calendar"></i>
                    <span><strong>Thời gian:</strong> ${formattedTime}</span>
                </div>
                <div class="event-card-detail-item">
                    <i class="bx bx-grid-alt"></i>
                    <span><strong>Thể lệ:</strong> ${parseMarkdownLinks(t.eventRules || 'Chưa có thông tin')}</span>
                </div>
                <div class="event-card-detail-item">
                    <i class="bx bxs-chess"></i>
                    <span><strong>Ván đấu:</strong> ${getGameRulesWithIcon(linkifyChessTerms(parseMarkdownLinks(t.gameRules || 'Chưa có thông tin')))}</span>
                </div>
                <div class="event-card-detail-item">
                    <i class="bx bxs-user-check"></i>
                    <span><strong>Tổ chức:</strong> ${mappedOrganizer}</span>
                </div>
            </div>
            <div class="event-card-footer">
                <button class="btn btn-secondary card-detail-btn" onclick="event.stopPropagation();"><i class="bx bx-info-circle"></i> Chi tiết</button>
                <a href="${t.joinLink || '#'}" target="_blank" class="card-join-link" onclick="if (!this.getAttribute('href') || this.getAttribute('href') === '#') { event.preventDefault(); event.stopPropagation(); alert('Hiện chưa có link giải, hãy hỏi các quản trị viên hoặc người tổ chức giải này để tìm hiểu thêm!'); } else { event.stopPropagation(); }">
                    <button class="btn btn-primary"><i class="bx bx-user-plus"></i> Tham gia</button>
                </a>
            </div>
        `;

        // Make the details button and overall card click open modal
        card.querySelector('.card-detail-btn').onclick = (e) => {
            e.stopPropagation();
            openModal(t);
        };
        card.onclick = () => {
            openModal(t);
        };

        listContainer.appendChild(card);
    });
}

/**
 * Get the Vietnamese name of the day of the week.
 * @param {string} dateStr - Date string.
 * @returns {string} Day of the week.
 */
function getDayOfWeekVn(dateStr) {
    const dateParts = getVietnamDateParts(dateStr);
    const date = new Date(dateParts.year, dateParts.month, dateParts.date);
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const map = ['Chủ Nhật', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy'];
    return map[day];
}

// Make functions globally available
window.switchView = switchView;
window.renderActiveView = renderActiveView;
window.changeMonth = changeMonth;
