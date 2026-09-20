---
layout: event
title: Bảng tổng giải Chiến Trường Thí Quân
---

<header>
    <h1 class="page-title">Các kỳ thủ đạt giải <a href="/events/cttq-chien-truong-thi-quan">Chiến Trường Thí Quân</a></h1>
    <p class="page-decription">Một sự kiện diễn ra trong câu lạc bộ Thí Vua Lấy Tốt và được tổ chức hàng tháng với giải thưởng là tư cách thành viên kim cương Chess.com 1 tháng.</p>
</header>
<ul class="nav-tabs">
    <li><a href="tvlt">Thí Vua Lấy Tốt</a></li>
    <li><a href="cbtt">Cờ Bí Thí Tốt</a></li>
    <li><a href="cttq" class="active">Chiến Trường Thí Quân</a></li>
    <li><a href="dttv">Đấu Trường Thí Vua</a></li>
</ul>

<div class="tournament-page-context">
    <p>Sự kiện được quản lý bởi <a href="/leaders#admin3">M-DinhHoangViet</a>. Xem <a href="/events/cttq-chien-truong-thi-quan">Thông tin chi tiết về sự kiện</a>.</p>
    <p><i>Nếu có đề xuất hoặc vấn đề gì thì hãy bình luận tại <a href="https://chess.com/clubs/forum/view/danh-sach-cac-giai-da-to-chuc-clb-tvlt?clubId=325849&quote_id=131524731&page=1#comment_box" target="_blank">forum này</a> hoặc liên hệ <a href="/leaders#admin3">Admin M-DinhHoangViet</a>.</i></p>
</div>
<div class="filter-group-container" style="margin-bottom: 25px;">
<div class="tour-top-grid">
<div class="tour-select-container" style="grid-column: span 2;"><select id="sortFilter" class="tour-select-btn" onchange="searchTable()"><option value="date-desc">Tháng tổ chức (Gần đây nhất)</option><option value="date-asc">Tháng tổ chức (Lâu đời nhất)</option><option value="players-desc">Số lượng kỳ thủ (Nhiều nhất)</option><option value="players-asc">Số lượng kỳ thủ (Ít nhất)</option><option value="tours-desc">Số lượng giải đấu (Nhiều nhất)</option><option value="tours-asc">Số lượng giải đấu (Ít nhất)</option></select></div>
<div class="tour-select-container" style="grid-column: span 2;"><select id="cttq-status-filter" class="tour-select-btn" onchange="searchTable()"><option value="all">Tất cả trạng thái</option><option value="finished">Đã hoàn thành</option><option value="unfinished">Chưa hoàn thành</option></select></div>
</div>
<div class="tour-search-row"><div class="tour-search-wrapper"><span class="bx bx-search tour-search-icon"></span><input type="text" id="searchInput" class="tour-search-input" placeholder="Tìm kiếm..." onkeyup="searchTable()"></div>
<div class="tour-misc"><label class="tour-switch-container"><span class="tour-switch"><input type="checkbox" id="premiumToggle" checked onchange="searchTable()"><span class="tour-slider"></span></span><span>Hiện Premium Badge</span></label><div id="loading-status" class="loading-status-badge"><span id="statusIcon" class="bx bx-dots-horizontal-rounded" style="color:var(--primary-warning)"></span><span id="current-tournament">0</span> tháng</div></div></div>
</div>
<section class="tournament-results-section">
    <div id="cttq-months-container" data-fetch-aggregated="cttq"></div>
</section>
<div class="tournament-page-brand">
    <a href="/events/cttq-chien-truong-thi-quan">
        <img src="/images/events/logo/cttq.png" alt="Chiến Trường Thí Quân">
    </a>
</div>

<script src="/js/aggregated-fetcher.js"></script>
