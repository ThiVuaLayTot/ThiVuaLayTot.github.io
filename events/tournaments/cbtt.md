---
layout: event
title: Bảng tổng giải Cờ Bí Thí Tốt
---

<header class="tournament-page-header">
    <h1 class="page-title">Các kỳ thủ đạt giải <a href="/events/cbtt-co-bi-thi-tot">Cờ Bí Thí Tốt</a></h1>
    <p class="page-decription">Một sự kiện diễn ra hàng tháng trong câu lạc bộ Thí Vua Lấy Tốt và được tổ chức với tiền thưởng...</p>
</header>

<ul class="nav-tabs">
    <li><a href="tvlt">Thí Vua Lấy Tốt</a></li>
    <li><a href="cbtt" class="active">Cờ Bí Thí Tốt</a></li>
    <li><a href="cttq">Chiến Trường Thí Quân</a></li>
    <li><a href="dttv">Đấu Trường Thí Vua</a></li>
</ul>

<div class="tournament-page-context">
    <p>Sự kiện được quản lý bởi <a href="/leaders#admin4">VN-SenJin</a>. Xem <a href="/events/cbtt-co-bi-thi-tot">Thông tin chi tiết về sự kiện</a>.</p>
    <p><i>Nếu có đề xuất hoặc vấn đề gì thì hãy bình luận tại <a href="https://chess.com/clubs/forum/view/danh-sach-cac-giai-da-to-chuc-clb-tvlt?clubId=325849&quote_id=131524731&page=1#comment_box" target="_blank">forum này</a> hoặc liên hệ <a href="/leaders#admin3">Admin M-DinhHoangViet</a>.</i></p>
</div>
<div class="filter-group-container" style="margin-bottom: 25px;">
<div class="tour-top-grid">
<div class="tour-dropdown" id="tournament-speed-dropdown"><div class="tour-dropdown-btn" onclick="toggleTourDropdown('tournament-speed-dropdown')"><div class="tour-dropdown-btn-content"><i class="bx bx-time"></i><span>Thể lệ</span></div><span class="bx bx-chevron-down tour-dropdown-arrow"></span></div><div class="tour-dropdown-menu" id="timeclass-checkbox-group">
<label class="custom-checkbox-container"><input type="checkbox" value="bullet" checked onchange="searchTable()"><span class="checkmark"></span> Bullet (Cờ Siêu chớp)</label>
<label class="custom-checkbox-container"><input type="checkbox" value="blitz" checked onchange="searchTable()"><span class="checkmark"></span> Blitz (Cờ chớp)</label>
<label class="custom-checkbox-container"><input type="checkbox" value="rapid" checked onchange="searchTable()"><span class="checkmark"></span> Rapid (Cờ Nhanh)</label></div></div>
<div class="tour-dropdown" id="tournament-variant-dropdown"><div class="tour-dropdown-btn" onclick="toggleTourDropdown('tournament-variant-dropdown')"><div class="tour-dropdown-btn-content"><i class="bx bxs-chess"></i><span>Biến thể</span></div><span class="bx bx-chevron-down tour-dropdown-arrow"></span></div><div class="tour-dropdown-menu" id="variant-checkbox-group">
<label class="custom-checkbox-container"><input type="checkbox" value="standard" checked onchange="searchTable()"><span class="checkmark"></span> Cờ tiêu chuẩn</label>
<label class="custom-checkbox-container"><input type="checkbox" value="chess960" checked onchange="searchTable()"><span class="checkmark"></span> Chess960</label>
<label class="custom-checkbox-container"><input type="checkbox" value="bughouse crazyhouse kingofthehill custom threecheck" checked onchange="searchTable()"><span class="checkmark"></span> Các biến thể khác</label></div></div>
<div class="tour-dropdown" id="tournament-format-dropdown"><div class="tour-dropdown-btn" onclick="toggleTourDropdown('tournament-format-dropdown')"><div class="tour-dropdown-btn-content"><i class="bx bx-medal"></i><span>Thể thức</span></div><span class="bx bx-chevron-down tour-dropdown-arrow"></span></div><div class="tour-dropdown-menu" id="format-checkbox-group">
<label class="custom-checkbox-container"><input type="checkbox" value="swiss" checked onchange="searchTable()"><span class="checkmark"></span> Hệ Thụy Sĩ (Swiss)</label>
<label class="custom-checkbox-container"><input type="checkbox" value="arena" checked onchange="searchTable()"><span class="checkmark"></span> Đấu trường Arena</label></div></div>
<div class="tour-select-container"><select id="sortFilter" class="tour-select-btn" onchange="searchTable()"><option value="date-desc">Ngày tổ chức (Gần đây nhất)</option><option value="date-asc">Ngày tổ chức (Lâu đời nhất)</option><option value="players-desc">Kỳ thủ tham gia (Nhiều nhất)</option><option value="players-asc">Kỳ thủ tham gia (Ít nhất)</option></select></div>
</div>
<div class="tour-search-row"><div class="tour-search-wrapper"><span class="bx bx-search tour-search-icon"></span><input type="text" id="searchInput" class="tour-search-input" placeholder="Tìm kiếm tên giải hoặc kỳ thủ..." onkeyup="searchTable()"></div>
<div class="tour-misc"><label class="tour-switch-container"><span class="tour-switch"><input type="checkbox" id="premiumToggle" checked onchange="searchTable()"><span class="tour-slider"></span></span><span>Hiện Premium Badge</span></label>
<div id="loading-status" class="loading-status-badge"><span id="statusIcon" class="bx bx-dots-horizontal-rounded" style="color:var(--primary-warning);font-size:medium"></span><span id="current-tournament">0</span> giải</div></div></div>
</div>

<section class="tournament-results-section">
    <div id="tournament-table" data-fetch-tournament="cbtt"></div>
</section>
<div class="tournament-page-brand tournament-page-brand--multi">
    <a href="/events/cbtt-co-bi-thi-tot">
        <img src="/images/events/logo/cbtt-arena.png" alt="CBTT Arena">
        <img src="/images/events/logo/cbtt-swiss.png" alt="CBTT Swiss">
        <img src="/images/events/logo/cbtt-rapid.png" alt="CBTT Rapid">
        <img src="/images/events/logo/cbtt-blitz.png" alt="CBTT Blitz">
        <img src="/images/events/logo/cbtt-superblitz.png" alt="CBTT SuperBlitz">
        <img src="/images/events/logo/cbtt-bullet.png" alt="CBTT Bullet">
        <img src="/images/events/logo/cbtt-960.png" alt="CBTT Chess960">
    </a>
</div>
