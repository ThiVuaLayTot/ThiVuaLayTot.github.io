---
layout: event
title: Bảng tổng giải Chiến Trường Thí Quân
---

<h1 align="center">Các kỳ thủ đạt giải <a href="/events/cttq-chien-truong-thi-quan" style="color: lightskyblue">Chiến Trường Thí Quân</a></h1>
<ul class="nav-tabs">
    <li><a href="tvlt">Thí Vua Lấy Tốt</a></li>
    <li><a href="cbtt">Cờ Bí Thí Tốt</a></li>
    <li><a href="cttq" class="active">Chiến Trường Thí Quân</a></li>
    <li><a href="dttv">Đấu Trường Thí Vua</a></li>
</ul><br>
<p>Giải được quản lý bởi Admin <a href="/leaders#admin3">M-DinhHoangViet</a>. <a href="/events/cttq-chien-truong-thi-quan">Chi tiết về sự kiện này.</a></p>
<div id="cttq-months-container"></div>

<!-- Score Detail Modal -->
<div id="scoreModal" class="cc-modal-overlay">
    <div class="cc-modal-dialog score-modal-dialog">
        <button class="cc-modal-close" onclick="ModalManager.close()">×</button>
        <div class="cc-modal-content-wrapper">
            <div class="cc-modal-header-row">
                <div class="cc-modal-title-section">
                    <h2 id="modal-player-name">Chi tiết điểm</h2>
                </div>
            </div>
            <div id="modal-score-breakdown"></div>
        </div>
    </div>
</div>

<style>
.score-pill {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    background: rgba(0, 242, 255, 0.1);
    border: 1px solid rgba(0, 242, 255, 0.2);
    color: var(--cyan-300);
    font-size: 0.8em;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
}

.score-pill:hover {
    background: rgba(0, 242, 255, 0.2);
    border-color: var(--cyan-400);
    transform: translateY(-1px);
    box-shadow: 0 0 8px rgba(0, 242, 255, 0.3);
}

.score-modal-dialog {
    max-width: 500px !important;
    grid-template-columns: 1fr !important;
    padding: 1.5rem !important;
}

.score-detail-table {
    margin-top: 1rem;
    font-size: 0.9em;
}

.score-detail-table th, .score-detail-table td {
    padding: 10px !important;
}

.score-detail-table tfoot td {
    background: rgba(255, 255, 255, 0.05);
    border-top: 2px solid var(--cyan-400);
}
</style>

<a href="/events/cttq-chien-truong-thi-quan"><img alt="Chiến Trường Thí Quân logo" src="/images/events/logo/cttq.png"></a>
<i>Nếu có vấn đề thì xin hãy liên hệ <a href="/leaders#admins" target="_top">quản trị viên</a>.</i>
<br>
<script src="/js/search-events.js"></script>
<script src="/js/cttq-fetcher.js"></script>
