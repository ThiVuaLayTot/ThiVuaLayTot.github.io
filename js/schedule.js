/**
 * @file Event Schedule Manager
 * @description Manages the tournament calendar and event modal for the schedule page.
 */

/** @type {Array} Global tournament data storage */
let tournaments = [];
/** @type {Object|null} Currently selected event for modal display */
let selectedEvent = null;

/** @type {string} Google Apps Script API endpoint */
const API_URL = 'https://script.google.com/macros/s/AKfycbLA4yW1KrvwzNzyOuWcCp3SQMmTvqcRhjkqAHUVMN4y35BOMaBhRwuSOsDgDKAVlLk7g/exec';

/**
 * Parses any date string and returns its parts in GMT+7 (Vietnam Time)
 * @param {string} dateStr - The date string to parse
 * @returns {Object} Date parts { year, month, date, hours, minutes }
 */
function getVietnamDateParts(dateStr) {
    if (!dateStr) return { year: 1970, month: 0, date: 1, hours: 0, minutes: 0 };
    let date;
    if (dateStr.includes('Z') || dateStr.includes('+')) {
        date = new Date(dateStr);
    } else {
        let formatted = dateStr.trim();
        if (formatted.includes(' ')) {
            formatted = formatted.replace(' ', 'T');
        }
        if (!formatted.includes('+') && !formatted.includes('Z')) {
            formatted += '+07:00';
        }
        date = new Date(formatted);
    }
    if (isNaN(date.getTime())) {
        date = new Date(dateStr);
    }
    if (isNaN(date.getTime())) {
        return { year: 1970, month: 0, date: 1, hours: 0, minutes: 0 };
    }

    // Add 7 hours to the UTC millisecond value to get GMT+7 epoch time,
    // then get the UTC components of that new date. This gives exactly the GMT+7 parts!
    const vnEpoch = date.getTime() + (7 * 3600 * 1000);
    const vnDate = new Date(vnEpoch);
    return {
        year: vnDate.getUTCFullYear(),
        month: vnDate.getUTCMonth(),
        date: vnDate.getUTCDate(),
        hours: vnDate.getUTCHours(),
        minutes: vnDate.getUTCMinutes()
    };
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
        const data = await response.json();

        const lastUpdatedStr = data.lastUpdated || (data.events && data.events.length > 0 ? data.events[0].timestamp : null) || '';
        let updateDate;
        if (lastUpdatedStr) {
            let formatted = lastUpdatedStr.trim();
            if (formatted.includes(' ')) {
                formatted = formatted.replace(' ', 'T');
            }
            if (!formatted.includes('+') && !formatted.includes('Z')) {
                formatted += '+07:00';
            }
            updateDate = new Date(formatted);
        }
        if (!updateDate || isNaN(updateDate.getTime())) {
            updateDate = new Date();
        }
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        const formattedDate = updateDate.toLocaleString('vi-VN', options);
        document.getElementById('last-updated').innerText = formattedDate;

        tournaments = data.events || data.tournaments || [];
        document.getElementById('loading').style.display = 'none';

        if (tournaments.length === 0) {
            document.getElementById('empty').style.display = 'block';
        } else {
            document.getElementById('calendar-wrapper').style.display = 'block';
            const filtersDiv = document.getElementById('schedule-filters');
            if (filtersDiv) filtersDiv.style.display = 'block';
            renderCalendar();
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
    const year = vnToday.getUTCFullYear();
    const month = vnToday.getUTCMonth();

    // Get filter values
    const searchVal = (document.getElementById('schedule-search')?.value || '').toLowerCase().trim();
    const onlyPrize = document.getElementById('schedule-prize-filter')?.checked || false;
    const checkedTypes = Array.from(document.querySelectorAll('#schedule-type-group input[type="checkbox"]:checked')).map(cb => cb.value);

    // Update header
    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    document.getElementById('month-title').textContent = `${monthNames[month]}/${year}`;

    // Get first day
    const firstDay = new Date(year, month, 1).getDay();
    const startDay = firstDay === 0 ? 6 : firstDay - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Create days array
    const days = [];

    for (let i = startDay - 1; i >= 0; i--) {
        days.push({
            day: daysInPrevMonth - i,
            isCurrentMonth: false
        });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        days.push({
            day: i,
            isCurrentMonth: true
        });
    }

    const remainingDays = 35 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
        days.push({
            day: i,
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
            if (dayObj.isCurrentMonth &&
                vnToday.getUTCFullYear() === year &&
                vnToday.getUTCMonth() === month &&
                vnToday.getUTCDate() === dayObj.day) {
                td.classList.add('today');
            }

            // Day number
            const dayNum = document.createElement('span');
            dayNum.className = 'day-number';
            dayNum.textContent = dayObj.day;
            dayNum.title = 'Hôm nay';
            td.appendChild(dayNum);

            // Events container
            const eventsDiv = document.createElement('div');
            eventsDiv.className = 'events-container';

            if (dayObj.isCurrentMonth) {
                const dayTournaments = tournaments.filter(t => {
                    const tParts = getVietnamDateParts(t.startTime);
                    return tParts.year === year &&
                        tParts.month === month &&
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
            }

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

    // 1. Search filter
    const searchVal = params.get('search');
    const searchInput = document.getElementById('schedule-search');
    if (searchInput && searchVal !== null) {
        searchInput.value = searchVal;
    }

    // 2. Prize filter (1 = prize, 0 = all)
    const prizeVal = params.get('prize');
    const prizeCheckbox = document.getElementById('schedule-prize-filter');
    if (prizeCheckbox && prizeVal !== null) {
        prizeCheckbox.checked = (prizeVal === '1');
    }

    // 3. Category/Type filter joined by space or plus
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

    // 1. Search filter
    const searchVal = (document.getElementById('schedule-search')?.value || '').trim();
    if (searchVal) {
        params.set('search', searchVal);
    }

    // 2. Prize filter
    const prizeCheckbox = document.getElementById('schedule-prize-filter');
    if (prizeCheckbox && prizeCheckbox.checked) {
        params.set('prize', '1');
    } else {
        params.set('prize', '0');
    }

    // 3. Category/Type filter
    const checkedTypes = Array.from(document.querySelectorAll('#schedule-type-group input[type="checkbox"]:checked')).map(cb => cb.value);
    const allTypes = Array.from(document.querySelectorAll('#schedule-type-group input[type="checkbox"]')).map(cb => cb.value);

    // If not all are checked, serialize the active ones joined by space
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
    renderCalendar();
}

window.filterSchedule = filterSchedule;
window.toggleTourDropdown = toggleTourDropdown;

/**
 * Opens the event detail modal with tournament information.
 * @param {Object} tournament - The tournament data object.
 */
function openModal(tournament) {
    selectedEvent = tournament;
    const tournamentType = tournament.eventType;
    let bannerUrl = tournament.bannerLink || "https://chess.com/bundles/web/images/404-pawn.f17f262c.gif";
    let newsUrl = "";
    let resultUrl = "";

    if (["cttq", "tvlt", "cbtt", "dttv"].includes(tournamentType)) {
        resultUrl = `/events/tournaments/${tournamentType}`;
        const eventInfo = {
            "tvlt": "/events/tvlt-thi-vua-lay-tot",
            "cttq": "/events/cttq-chien-truong-thi-quan",
            "cbtt": "/events/cbtt-co-bi-thi-tot",
            "dttv": "/events/tournaments/dttv"
        };
        const bannerDefault = {
            "tvlt": "/images/events/sieu-giai-thi-vua-lay-tot.png",
            "cttq": "/images/events/giai-chien-truong-thi-quan.png",
            "cbtt": "/images/events/su-kien-co-bi-thi-tot.png",
            "dttv": "/images/events/dau-truong-thi-vua.png"
        };
        bannerUrl = tournament.bannerLink || bannerDefault[tournamentType];
        newsUrl = tournament.newsLink || eventInfo[tournamentType];
    } else {
        resultUrl = `https://chess.com/clubs/events/thi-vua-lay-tot-tungjohn-playing-chess?cid=325849&ref_id=89365835&type=${tournamentType}`;
        const bannerDefault = {
            "1wl": "https://images.chesscomfiles.com/uploads/v1/blog/1036746.ca7cfdc5.668x375o.1821c106decb.jpg",
            "club-arena": "https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/VN-SenJin/phpjs58p98gfqbbaDynSFJ.png",
            "multi-club-arena": "https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/VN-SenJin/php4oaq7r23q7n79I3kRE6.png",
            "swiss": "https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/VN-SenJin/phpt9ef43prdg6f80YfkLo.png",
            "vote": "https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/M-DinhHoangViet/php8s3ooliju70kciI1yut.png",
            "daily": "https://images.chesscomfiles.com/uploads/v1/chess_term/f1e3ca50-b739-11ea-a14a-a1c9be904231.1fc2467a.630x354o.73dd2efd0681.png"
        };
        const eventDetails = {
            "1wl": "https://chess.com/blog/OneWorldLeague",
            "club-arena": "https://support.chess.com/articles/8562889-what-are-arena-tournaments",
            "swiss": "https://chess.com/terms/swiss-chess",
            "vote": "https://support.chess.com/articles/8614177-how-do-i-play-vote-chess",
            "daily": "https://chess.com/terms/correspondence-chess",
            "multi-club-arena": "https://support.chess.com/articles/8562889-what-are-arena-tournaments"
        };
        bannerUrl = tournament.bannerLink || bannerDefault[tournamentType] || "https://chess.com/bundles/web/images/404-pawn.f17f262c.gif";
        newsUrl = tournament.newsLink || eventDetails[tournamentType] || "https://support.chess.com";
    }

    document.getElementById('modal-name').innerHTML = `<a href="${tournament.joinLink}" target="_blank">${tournament.eventName || 'Chi tiết giải đấu'}</a>`;

    let categoryText = tournament.prize || 'Giao lưu';
    if (tournament.isTentative) {
        categoryText += ` • ${tournament.isTentative}`;
    }
    document.getElementById('modal-category').textContent = categoryText;
    document.getElementById('modal-organizer').innerHTML = tournament.organizer || 'Quản trị viên';

    const tParts = getVietnamDateParts(tournament.startTime);
    const paddedMinutes = String(tParts.minutes).padStart(2, '0');
    const paddedHours = String(tParts.hours).padStart(2, '0');
    const paddedDate = String(tParts.date).padStart(2, '0');
    const paddedMonth = String(tParts.month + 1).padStart(2, '0');
    let formattedTime = `${paddedHours}:${paddedMinutes}, ngày ${paddedDate}/${paddedMonth}/${tParts.year}`;

    let gameRulesText = tournament.gameRules || 'Chưa có thông tin';
    let eventRulesText = tournament.eventRules || 'Chưa có thông tin';

    if (tournament.isTentative === 'Dự kiến' || tournament.isTentative === 'Tentative') {
        formattedTime = 'Dự kiến ' + formattedTime;
        if (gameRulesText !== 'Chưa có thông tin') {
            gameRulesText = 'Dự kiến ' + gameRulesText;
        }
        if (eventRulesText !== 'Chưa có thông tin') {
            eventRulesText = 'Dự kiến ' + eventRulesText;
        }
    }

    document.getElementById('modal-time').innerText = formattedTime;
    document.getElementById('modal-game-rules').textContent = gameRulesText;
    document.getElementById('modal-event-rules').textContent = eventRulesText;

    document.getElementById('modal-logo').src = tournament.logo;
    document.getElementById('modal-banner').src = bannerUrl;

    const joinLink = document.getElementById('modal-join');
    const ruleLink = document.getElementById('modal-rule');
    const resultLink = document.getElementById('modal-results');

    ruleLink.href = newsUrl || '#';
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
