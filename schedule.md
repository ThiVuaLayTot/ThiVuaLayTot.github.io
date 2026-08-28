---
layout: default
title: Lịch sự kiện của tháng
---

<ul style="list-style-type: circle;">
    <li style="text-align: center;"><strong><span style="font-size: 14px;">Lịch sẽ được cập nhật thường xuyên và thường không báo trước khi có thay đổi</span></strong></li>
    <li style="text-align: center;"><strong><span style="font-size: 14px;">Ấn vào icon để xem chi tiết thông sự kiện</span></strong></li>
</ul>
<br>
<p><i>Lần cuối cập nhật: <span id="last-updated"></span></i>.<br>Nếu có vấn đề hãy bình luận trong <a
        href="https://chess.com/clubs/forum/view/lich-su-kien-hang-thang-clb-tvlt?clubId=325849&quote_id=125015758&page=1#comment_box"
        target="_blank">forum này</a> hoặc liên hệ <a href="/leaders#admin3" target="_top">M-DinhHoangViet</a>.</p>
<br>
<div id="schedule-filters" class="schedule-control-bar" style="display: none;">
    <!-- Left: Search input -->
    <div class="control-item search-wrapper">
        <span class="bx bx-search search-icon"></span>
        <input type="text" id="schedule-search" class="control-input search-input" placeholder="Tìm kiếm sự kiện..."
            oninput="filterSchedule()">
    </div>
    <!-- Right: Controls group (Dropdown, Switch, Segmented Switcher) -->
    <div class="control-group">
        <div class="tour-dropdown" id="schedule-category-dropdown">
            <div class="tour-dropdown-btn compact-btn" onclick="toggleTourDropdown('schedule-category-dropdown')">
                <div class="tour-dropdown-btn-content">
                    <i class="bx bx-filter-alt"></i>
                    <span>Thể loại</span>
                </div>
                <span class="bx bx-chevron-down tour-dropdown-arrow"></span>
            </div>
            <div class="tour-dropdown-menu" id="schedule-type-group">
                <label class="custom-checkbox-container">
                    <input type="checkbox" value="tvlt" checked onchange="filterSchedule()">
                    <span class="checkmark"></span> Thí Vua Lấy Tốt
                </label>
                <label class="custom-checkbox-container">
                    <input type="checkbox" value="cttq" checked onchange="filterSchedule()">
                    <span class="checkmark"></span> Chiến Trường Thí Quân
                </label>
                <label class="custom-checkbox-container">
                    <input type="checkbox" value="cbtt" checked onchange="filterSchedule()">
                    <span class="checkmark"></span> Cờ Bí Thí Tốt
                </label>
                <label class="custom-checkbox-container">
                    <input type="checkbox" value="dttv" checked onchange="filterSchedule()">
                    <span class="checkmark"></span> Đấu Trường Thí Vua
                </label>
                <label class="custom-checkbox-container">
                    <input type="checkbox" value="multi-club-arena" checked onchange="filterSchedule()">
                    <span class="checkmark"></span> Multi-Club Arena (Đấu trường đa CLB)
                </label>
                <label class="custom-checkbox-container">
                    <input type="checkbox" value="club-arena" checked onchange="filterSchedule()">
                    <span class="checkmark"></span> Đấu trường Arena
                </label>
                <label class="custom-checkbox-container">
                    <input type="checkbox" value="swiss" checked onchange="filterSchedule()">
                    <span class="checkmark"></span> Hệ Thụy Sĩ (Swiss)
                </label>
                <label class="custom-checkbox-container">
                    <input type="checkbox" value="vote" checked onchange="filterSchedule()">
                    <span class="checkmark"></span> Cờ vua bỏ phiếu (Votechess)
                </label>
                <label class="custom-checkbox-container">
                    <input type="checkbox" value="daily" checked onchange="filterSchedule()">
                    <span class="checkmark"></span> Cờ hàng ngày (Daily)
                </label>
            </div>
        </div>
        <label class="compact-switch-container">
            <span class="compact-switch">
                <input type="checkbox" id="schedule-prize-filter" onchange="filterSchedule()">
                <span class="compact-slider"></span>
            </span>
            <span class="switch-label">Chỉ có thưởng</span>
        </label>
        <div id="view-switcher-container" class="segmented-control" style="display: none;">
            <button id="btn-view-calendar" class="segment-btn" onclick="switchView('calendar')" title="Xem dạng lịch">
                <i class="bx bx-calendar"></i>
                <span>Lịch</span>
            </button>
            <button id="btn-view-list" class="segment-btn" onclick="switchView('list')" title="Xem dạng danh sách">
                <i class="bx bx-list-ul"></i>
                <span>Danh sách</span>
            </button>
        </div>
    </div>
</div>

<div class="month-nav-wrapper">
    <button class="month-nav-btn" id="btn-prev-month" onclick="changeMonth(-1)" title="Tháng trước">
        <i class="bx bx-chevron-left"></i>
    </button>
    <div class="month-title" id="month-title">Processing...</div>
    <button class="month-nav-btn" id="btn-next-month" onclick="changeMonth(1)" title="Tháng sau">
        <i class="bx bx-chevron-right"></i>
    </button>
</div>
<div id="loading" class="loading">
    <div class="loading-spinner"></div>
    <p style="font-size: 1.1em; margin-top: 20px;">Đang tải dữ liệu...</p>
</div>

<div id="calendar-wrapper" style="display: none;">
    <table id="calendar-table">
        <thead>
            <tr>
                <th title="Thứ Hai">Mon</th>
                <th title="Thứ Ba">Tue</th>
                <th title="Thứ Tư">Wed</th>
                <th title="Thứ Năm">Thu</th>
                <th title="Thứ Sáu">Fri</th>
                <th title="Thứ Bảy">Sat</th>
                <th title="Chủ Nhật">Sun</th>
            </tr>
        </thead>
        <tbody id="calendar-body">
        </tbody>
    </table>
</div>

<!-- List View Container -->
<div id="list-wrapper" style="display: none;">
    <div id="list-container" class="events-list-grid"></div>
</div>

<div id="error" style="display: none;"></div>
<div id="empty" style="display: none;" class="empty-message">
    <i class="bx bx-calendar" style="color: #00f2ff; font-size: 2em; margin-bottom: 10px;"></i>
    <p>Không có giải đấu trong tháng này</p>
</div>
<br>
<style>.inl-bl{display: inline-block;width: 50px}</style>
<div>
    <a href="/events/tvlt-thi-vua-lay-tot" style="display: block" target="_top"><img src="/images/tvltlogo.png" alt="TVLT" title="Thí Vua Lấy Tốt" class="inl-bl">: <b>Siêu giải Thí Vua Lấy Tốt</b></a><br>
    <a href="/events/cttq-chien-truong-thi-quan" style="display: block" target="_top"><img src="/images/events/logo/cttq.png" alt="CTTQ" title="Chiến Trường Thí Quân" class="inl-bl">: <b>Sự kiện Chiến Trường Thí Quân</b></a><br>
    <a href="/events/cbtt-co-bi-thi-tot" style="display: block" target="_top"><img src="/images/events/logo/cbtt-rapid.png" alt="CBTT Rapid" title="Cờ Bí Thí Tốt Rapid" class="inl-bl"><img src="/images/events/logo/cbtt-blitz.png" alt="CBTT Blitz" title="Cờ Bí Thí Tốt Blitz" class="inl-bl"><img src="/images/events/logo/cbtt-superblitz.png" alt="CBTT SuperBlitz" title="Cờ Bí Thí Tốt SuperBlitz" class="inl-bl"><img src="/images/events/logo/cbtt-bullet.png" alt="CBTT Bullet" title="Cờ Bí Thí Tốt Bullet" class="inl-bl"><img src="/images/events/logo/cbtt-960.png" title="Cờ Bí Thí Tốt Chess960" alt="CBTT Chess960" class="inl-bl">: <b>Giải đấu Cờ Bí Thí Tốt</b></a><br>
    <a href="https://chess.com/clubs/events/thi-vua-lay-tot-tungjohn-playing-chess?clubId=325849&ref_id=89365835&cid=325849" target="_blank" style="display: block"><img src="https://chess.com/bundles/web/images/color-icons/time-daily.a2f7bbb6.svg" title="Daily Chess Matches" class="inl-bl"><img src="https://chess.com/bundles/web/images/color-icons/tournaments.3a561883.svg" title="Giải đấu hệ Thụy Sĩ (Swiss tournament)" class="inl-bl"><img src="https://chess.com/bundles/web/images/color-icons/arena-club-multi.b56c9ae4.svg" title="Đấu trường đa câu lạc bộ (Multi-Club Arena)" class="inl-bl"><img src="https://chess.com/bundles/web/images/color-icons/clipboard-vote.svg" title="Cờ vua bỏ phiếu (Votechess)" class="inl-bl"><img src="https://chess.com/bundles/web/images/color-icons/arena-club.495ffa75.svg" title="Giải đấu Đấu trường (Arena)" class="inl-bl">: <b>Các thể loại giải đấu khác</b></a>
</div>
<!-- Modal -->
<div id="eventModal" class="cc-modal-overlay" aria-hidden="true" role="dialog" aria-modal="true">
    <div class="cc-modal-dialog" role="document">
        <div class="cc-modal-banner-section">
            <img id="modal-banner" src="/" alt="Banner">
        </div>
        <button class="cc-modal-close" onclick="closeModal()" aria-label="Đóng cửa sổ">×</button>
        <div class="cc-modal-content-wrapper">
            <div class="cc-modal-header-row">
                <div class="cc-modal-logo-box">
                    <a id="modal-logo-link" href="#" target="_blank" title="Xem trang thể lệ của giải đấu">
                        <img src="/images/tvltlogo.png" alt="Logo" id="modal-logo">
                    </a>
                </div>
                <div class="cc-modal-title-section" style="flex: 1;">
                    <div class="cc-modal-category" id="modal-category"></div>
                    <h2 id="modal-name"></h2>
                </div>
            </div>
            <div class="cc-modal-info-section">
                <div class="cc-modal-info-item">
                    <i class="icon-font-chess events-list-icon chess-board"></i>
                    <div>
                        <strong><span class="bx bx-grid-alt"></span> Thể lệ giải đấu:</strong>
                        <span id="modal-event-rules"></span>
                    </div>
                </div>
                <div class="cc-modal-info-item">
                    <i class="icon-font-chess events-list-icon chess-board"></i>
                    <div>
                        <strong><span class="bx bxs-chess"></span> Thể lệ ván đấu:</strong>
                        <span id="modal-game-rules"></span>
                    </div>
                </div>
                <div class="cc-modal-info-item">
                    <i class="icon-font-chess calendar events-list-icon"></i>
                    <div>
                        <strong><span class="bx bx-calendar"></span> Thời gian bắt đầu:</strong>
                        <span id="modal-time"></span>
                    </div>
                </div>
                <div class="cc-modal-info-item">
                    <i class="icon-font-chess post-view-meta-club-admin user-shield"></i>
                    <div>
                        <strong><span class="bx bxs-user-check"></span> Tổ chức bởi:</strong>
                        <span id="modal-organizer"></span>
                    </div>
                </div>
            </div>
        </div>
        <div class="btn-group">
            <a id="modal-join" href="#" target="_blank"><button class="btn btn-primary" type="button"><span class="bx bx-user-plus"></span> Tham gia</button></a>
            <a id="modal-rule" href="#" target="_blank"><button class="btn btn-secondary" type="button"><span class="bx bx-task"></span> Thể lệ</button></a>
            <a id="modal-results" href="#" target="_blank"><button class="btn btn-secondary" type="button"><span class="bx bx-trophy"></span> Kết quả</button></a>
        </div>
    </div>
<style>
.month-nav-wrapper{display:flex;align-items:center;justify-content:center;gap:15px;margin-bottom:20px;width:100%}
.month-nav-btn{background:rgba(10,25,47,.65);border:1.5px solid var(--cyan-400);border-radius:var(--border-radius-lg);color:var(--cyan-300);width:44px;height:44px;font-size:24px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .3s cubic-bezier(.4,0,.2,1);box-shadow:0 4px 10px rgba(0,242,255,.05);outline:none}
.month-nav-btn:hover{background:rgba(0,242,255,.1);color:var(--cyan-100);border-color:var(--cyan-300);box-shadow:0 0 15px rgba(0,242,255,.25);transform:translateY(-2px)}
.month-nav-btn:active,.btn-switcher:active,.btn-primary:active,.btn-secondary:active{transform:translateY(0)}
.month-title{flex:1;max-width:400px;text-align:center;font-size:var(--fs-2xl);font-family:cursive;font-weight:var(--fw-bold);color:var(--cyan-400);text-transform:uppercase;text-shadow:0 0 6px var(--cyan-300);padding:var(--space-md);background:linear-gradient(180deg,var(--color-bg-secondary) 0%,var(--color-bg-tertiary) 100%);border:var(--border-width-base) solid var(--cyan-400);border-radius:var(--border-radius-lg);box-shadow:0 0 15px var(--cyan-200),0 0 30px rgba(0,242,255,.4)}

#calendar-wrapper,.calendar-wrapper{width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:12px;border-radius:12px}
table{width:100%;border-collapse:collapse;background:radial-gradient(circle at center,var(--color-bg-tertiary) 0%,var(--color-bg-primary) 100%);border:var(--border-width-base) solid var(--cyan-400);border-radius:var(--border-radius-lg);box-shadow:0 0 15px var(--cyan-200),0 0 30px rgba(0,242,255,.4),inset 0 0 20px rgba(0,242,255,.1)}
thead{background:linear-gradient(180deg,rgba(37,99,235,.9) 0%,rgba(29,78,216,.9) 100%);text-shadow:0 1px 2px rgba(0,0,0,.4);position:sticky;top:0}
thead tr{height:38px}
thead th{width:14.2857%;text-align:center;color:var(--neutral-50);font-weight:var(--fw-bold);padding:8px 6px;border-right:1px solid rgba(255,255,255,.15);border-bottom:var(--border-width-base) solid rgba(255,255,255,.2);border-top:1px solid rgba(255,255,255,.1);text-transform:uppercase;font-size:var(--fs-xs);letter-spacing:.5px;background:linear-gradient(180deg,rgba(37,99,235,.9) 0%,rgba(29,78,216,.9) 100%);border-left-style:hidden;text-shadow:0 1px 2px rgba(0,0,0,.4);box-shadow:0 2px 8px rgba(0,0,0,.15),inset 0 1px 0 rgba(255,255,255,.15);transition:all var(--transition-base)}
thead th:hover{background:linear-gradient(180deg,rgba(59,130,246,.95) 0%,rgba(37,99,235,.95) 100%);color:#fff}
thead th:first-child{border-left:var(--border-width-base) solid var(--cyan-400)}

tbody tr{height:auto;min-height:100px;font-size:75%}
tbody td{width:14.2857%;vertical-align:top;padding:10px 8px;border:1px solid rgba(53,201,252,.6);position:relative;min-height:100px;min-width:124px;transition:background-color var(--transition-fast) ease,box-shadow var(--transition-fast) ease}
tbody td:hover{box-shadow:inset 0 0 15px rgba(0,242,255,.15)}
tbody tr:nth-child(odd) td:nth-child(odd),tbody tr:nth-child(even) td:nth-child(even){background:linear-gradient(to bottom,rgba(255,255,255,.04),rgba(0,0,0,.14)),var(--color-bg-secondary)}
tbody tr:nth-child(odd) td:nth-child(even),tbody tr:nth-child(even) td:nth-child(odd){background:linear-gradient(to bottom,rgba(255,255,255,.05),rgba(0,0,0,.18)),var(--color-bg-tertiary)}

.day-number{font-size:var(--fs-base);font-weight:var(--fw-bold);color:var(--neutral-300);margin-bottom:var(--space-sm);opacity:1;display:block;text-align:center;width:100%;pointer-events:none}
td.other-month .day-number{opacity:.35;color:var(--neutral-500)}
td.today .day-number{color:var(--yellow-400)!important;opacity:1!important;font-weight:var(--fw-bold);font-size:var(--fs-xl);text-shadow:0 0 5px rgba(250,204,21,.5)}

.events-container{display:flex;width:100%;min-height:60px;justify-content:center;align-items:center}
.event-icon{cursor:pointer;display:inline-flex;align-items:center;justify-content:center;width:60px;height:60px;filter:drop-shadow(0 0 5px var(--cyan-300));transition:all var(--transition-fast) cubic-bezier(.4,0,.2,1);border-radius:var(--border-radius-sm);flex-shrink:0;position:relative}
.event-icon:hover{filter:drop-shadow(0 0 6px rgba(125,211,255,.9));transform:scale(1.15) translateY(-2px)}
.event-icon.tentative{filter:drop-shadow(0 0 4px var(--yellow-400))}
.event-icon.tentative:hover{filter:drop-shadow(0 0 7px var(--yellow-300))}
.event-icon.has-prize::after{content:"🏆";position:absolute;top:-2px;right:-2px;font-size:14px;line-height:1;filter:drop-shadow(0 0 3px rgba(251,191,36,.8));animation:bouncePrize 2s infinite ease-in-out}
.event-icon img{width:55px;height:55px;object-fit:contain;cursor:pointer}

@keyframes bouncePrize{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
@keyframes slideIn{from{transform:translateY(-50px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}

.modal{display:none;position:fixed;z-index:100;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,.8);animation:fadeIn .3s}
.modal-content{background:radial-gradient(circle at top left,var(--color-bg-tertiary) 0%,var(--color-bg-primary) 100%);margin:5% auto;padding:var(--space-lg);border-radius:var(--border-radius-lg);width:90%;max-width:600px;border:var(--border-width-base) solid var(--cyan-400);box-shadow:0 0 20px rgba(0,242,255,.3),0 0 40px rgba(0,102,204,.2);animation:slideIn var(--transition-base);color:var(--neutral-300);max-height:80vh;overflow-y:auto}
.close-modal{color:var(--neutral-500);float:right;font-size:var(--fs-3xl);font-weight:var(--fw-bold);cursor:pointer}
.close-modal:hover{color:var(--cyan-300);text-shadow:0 0 5px rgba(0,242,255,.5)}
.modal-header{border-bottom:var(--border-width-thick) solid var(--cyan-400);padding-bottom:var(--space-md);margin-bottom:var(--space-lg)}
.modal-header h2 a{color:var(--cyan-400);margin:0;font-size:var(--fs-2xl);text-shadow:0 0 6px var(--cyan-300)}
.modal-banner{width:100%;max-height:300px;object-fit:cover;border-radius:var(--border-radius-md);margin-bottom:var(--space-lg);border:var(--border-width-thin) solid var(--cyan-400)}
.modal-body{line-height:1.8}
.modal-body p{margin-bottom:15px;display:flex;align-items:flex-start}
.modal-body strong{color:var(--cyan-400);display:inline-block;min-width:120px;font-weight:var(--fw-bold);text-shadow:0 0 3px rgba(0,242,255,.3)}
.modal-body i{color:var(--cyan-300);margin-right:var(--space-md);min-width:20px;margin-top:2px;filter:drop-shadow(0 0 3px rgba(0,242,255,.3))}

.cc-modal-banner-section{width:100%;overflow:hidden;position:relative;grid-column:1;grid-row:1}
.btn-group{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:1.5rem;grid-column:1;grid-row:3;width:100%;justify-items:stretch}
.btn-group a{display:block;width:100%;text-decoration:none}
.btn{width:100%;height:44px;border:none;border-radius:10px;cursor:pointer;font-weight:600;font-size:14px;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:all .25s cubic-bezier(.4,0,.2,1);box-sizing:border-box;white-space:nowrap}
.btn-primary{background:linear-gradient(135deg,rgba(0,102,204,.45) 0%,rgba(0,242,255,.45) 100%);color:var(--cyan-200);border:var(--border-width-base) solid var(--cyan-400);box-shadow:0 4px 12px rgba(0,242,255,.15)}
.btn-primary:hover{transform:translateY(-2px);background:linear-gradient(135deg,rgba(0,102,204,.6) 0%,rgba(0,242,255,.6) 100%);box-shadow:0 6px 20px rgba(0,242,255,.35);border-color:var(--cyan-300);color:#fff}
.btn-secondary{background:rgba(13,27,42,.5);color:var(--cyan-300);border:var(--border-width-base) solid rgba(0,242,255,.3);box-shadow:none}
.btn-secondary:hover{transform:translateY(-2px);background:rgba(31,60,100,.45);color:var(--cyan-200);border-color:var(--cyan-400);box-shadow:0 4px 15px rgba(0,242,255,.15)}

.loading{text-align:center;padding:60px 20px;color:var(--cyan-400);text-shadow:0 0 5px rgba(0,242,255,.3)}
.loading-spinner{border:4px solid rgba(0,242,255,.1);border-top:4px solid var(--cyan-300);border-right:4px solid var(--cyan-400);border-radius:50%;width:50px;height:50px;animation:spin var(--animation-duration-base) linear infinite;margin:0 auto 20px;box-shadow:0 0 10px rgba(0,242,255,.3)}
.error{background:rgba(239,68,68,.1);color:var(--red-300);padding:var(--space-md);border-radius:var(--border-radius-md);margin:var(--space-lg);border:var(--border-width-base) solid var(--red-400);box-shadow:0 0 10px rgba(239,68,68,.2)}
.empty-message{text-align:center;padding:40px;color:var(--neutral-500);font-size:var(--fs-lg);text-shadow:0 0 3px rgba(0,242,255,.2)}

.cc-modal-overlay{position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;opacity:0;visibility:hidden;transition:opacity .25s ease,visibility .25s ease;z-index:200}
.cc-modal-overlay.open{opacity:1;visibility:visible}
.cc-modal-dialog{background:radial-gradient(circle at top left,var(--color-bg-tertiary) 0%,var(--color-bg-primary) 100%);border-radius:var(--border-radius-xl);width:max-content;max-width:max-content;max-height:85vh;overflow:hidden;border:var(--border-width-base) solid var(--cyan-400);box-shadow:0 0 20px rgba(0,242,255,.3),0 0 40px rgba(0,102,204,.2);display:grid;grid-template-columns:470px 520px;grid-template-rows:auto;gap:0 1rem;padding:1rem;box-sizing:border-box}
.cc-modal-banner-section{background:var(--color-bg-primary);max-height:320px;border-radius:14px;border:var(--border-width-thin) solid rgba(53,201,252,.18);box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}
.cc-modal-banner-section img{width:100%;height:100%;object-fit:cover;display:block}
.cc-modal-content-wrapper{padding:1.5rem;overflow-y:auto;grid-column:2;grid-row:1/4;display:flex;flex-direction:column;gap:1rem;min-width:0}
.cc-modal-header-row{display:flex;gap:1rem;align-items:flex-start;margin-bottom:1.2rem}
.cc-modal-logo-box{flex:0 0 80px;width:80px;height:80px;border-radius:var(--border-radius-lg);overflow:hidden;background-color:rgba(9,27,47,.8);border:var(--border-width-base) solid var(--cyan-400);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.cc-modal-logo-box a{width:100%;height:100%;display:flex;align-items:center;justify-content:center}
.cc-modal-logo-box img{width:80%;height:80%;object-fit:contain}
.cc-modal-title-section h2{color:var(--cyan-400);margin:0 0 .3rem;font-size:var(--fs-2xl);text-shadow:0 0 4px var(--cyan-300);line-height:1.2}
.cc-modal-category{text-transform:uppercase;font-size:.75em;font-weight:var(--fw-bold);color:var(--blue-400);margin-bottom:.5em;letter-spacing:.5px;display:flex;gap:var(--space-xs);flex-wrap:wrap;align-items:center}

.badge-schedule{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:50px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);transition:all .3s cubic-bezier(.4,0,.2,1);user-select:none}
.badge-schedule i{font-size:12px}
.badge-giao-luu{background:rgba(16,185,129,.1);color:#34d399;border:1px solid rgba(16,185,129,.45);box-shadow:0 0 10px rgba(16,185,129,.15),inset 0 0 4px rgba(16,185,129,.1)}
.badge-giao-luu:hover{background:rgba(16,185,129,.18);box-shadow:0 0 14px rgba(16,185,129,.35),inset 0 0 6px rgba(16,185,129,.2);transform:translateY(-1px)}
.badge-co-thuong{background:rgba(245,158,11,.1);color:#fbbf24;border:1px solid rgba(245,158,11,.45);box-shadow:0 0 12px rgba(245,158,11,.22),inset 0 0 4px rgba(245,158,11,.1);animation:goldShimmer 3s infinite ease-in-out}
.badge-co-thuong:hover{background:rgba(245,158,11,.18);box-shadow:0 0 18px rgba(245,158,11,.45),inset 0 0 6px rgba(245,158,11,.25);transform:translateY(-1px)}
.badge-tentative{background:rgba(244,63,94,.08);color:#f43f5e;border:1px solid rgba(244,63,94,.4);box-shadow:0 0 10px rgba(244,63,94,.15),inset 0 0 4px rgba(244,63,94,.1)}
.badge-tentative:hover{background:rgba(244,63,94,.15);box-shadow:0 0 14px rgba(244,63,94,.35),inset 0 0 6px rgba(244,63,94,.2);transform:translateY(-1px)}

.cc-modal-info-section{display:grid;grid-template-columns:1fr;gap:1rem;padding:1rem;width:100%;background:rgba(255,255,255,.02);border-radius:10px;border:1px solid rgba(47,185,255,.2)}
.cc-modal-info-item{display:flex;align-items:flex-start;gap:.8rem;font-size:1rem}
.cc-modal-info-item i{color:var(--cyan-300);min-width:20px;margin-top:2px;filter:drop-shadow(0 0 3px rgba(0,242,255,.3))}
.cc-modal-info-item strong{color:var(--cyan-400);min-width:80px;font-weight:var(--fw-semibold)}
.cc-modal-close{position:absolute;right:1rem;top:1rem;width:2.5rem;height:2.5rem;border:var(--border-width-base) solid var(--cyan-400);border-radius:var(--border-radius-full);background:rgba(10,32,54,.95);color:var(--color-text-primary);font-size:var(--fs-xl);line-height:1.5rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all var(--transition-fast) ease;z-index:10}
.cc-modal-close:hover{transform:scale(1.1);background:rgba(0,242,255,.25);color:var(--cyan-300);box-shadow:0 0 10px rgba(0,242,255,.4)}

.schedule-control-bar{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;gap:12px;background:rgba(10,25,47,.4);border:1px solid rgba(53,201,252,.25);border-radius:12px;padding:8px 12px;margin-bottom:20px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:0 4px 15px rgba(0,0,0,.15),inset 0 0 10px rgba(0,242,255,.02)}
.control-item{display:flex;align-items:center}
.search-wrapper{position:relative;flex:1;min-width:160px;max-width:300px}
.control-input{width:100%;background:rgba(10,25,47,.6);border:1px solid rgba(53,201,252,.4);border-radius:8px;color:var(--cyan-100);padding:0 12px 0 32px;font-size:13px;outline:none;transition:all .25s ease;height:30px;box-sizing:border-box}
.control-input:focus{border-color:var(--cyan-300);background:rgba(10,25,47,.8);box-shadow:0 0 10px rgba(0,242,255,.2)}
.search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:rgba(0,242,255,.55);font-size:15px;pointer-events:none}
.control-group{display:flex;align-items:center;gap:15px;flex-wrap:nowrap}

.tour-dropdown-btn.compact-btn{padding:6px 12px;border-radius:8px;font-size:13px;background:rgba(10,25,47,.6);border:1px solid rgba(53,201,252,.4);height:30px;box-shadow:none}
.tour-dropdown-btn.compact-btn .tour-dropdown-btn-content{gap:6px}
.tour-dropdown-btn.compact-btn .tour-dropdown-btn-content i{font-size:14px}
.tour-dropdown-btn.compact-btn .tour-dropdown-arrow{font-size:11px;margin-left:4px}

.compact-switch-container{display:inline-flex;align-items:center;gap:6px;cursor:pointer;user-select:none;font-size:13px;color:var(--neutral-300);white-space:nowrap}
.compact-switch{position:relative;display:inline-block;width:32px;height:18px}
.compact-switch input,.tour-switch input{opacity:0;width:0;height:0}
.compact-slider{position:absolute;cursor:pointer;inset:0;background-color:rgba(30,41,59,.8);border:1px solid rgba(0,242,255,.25);transition:.2s ease;border-radius:18px}
.compact-slider:before{position:absolute;content:"";height:12px;width:12px;left:2px;bottom:2px;background-color:var(--neutral-400);transition:.2s ease;border-radius:50%}
.compact-switch input:checked+.compact-slider{background-color:rgba(0,242,255,.15);border-color:var(--cyan-300)}
.compact-switch input:checked+.compact-slider:before{transform:translateX(14px);background-color:var(--cyan-300);box-shadow:0 0 5px var(--cyan-300)}

.segmented-control{display:flex;background:rgba(10,25,47,.7);border:1px solid rgba(53,201,252,.4);border-radius:8px;padding:2px;height:30px;box-sizing:border-box;align-items:center}
.segment-btn{background:transparent;border:none;border-radius:6px;color:var(--cyan-300);padding:0 12px;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s cubic-bezier(.4,0,.2,1);display:flex;align-items:center;gap:4px;height:100%;outline:none;white-space:nowrap}
.segment-btn:hover{color:var(--cyan-100);background:rgba(0,242,255,.05)}
.segment-btn.active{background:linear-gradient(135deg,rgba(0,102,204,.6) 0%,rgba(0,242,255,.6) 100%);color:#fff;box-shadow:0 2px 6px rgba(0,242,255,.25)}

.custom-checkbox-container{display:inline-flex;align-items:center;position:relative;padding-left:28px;margin-right:15px;margin-bottom:8px;cursor:pointer;font-size:14px;color:var(--cyan-100);user-select:none;transition:all .2s ease}
.custom-checkbox-container input{position:absolute;opacity:0;cursor:pointer;height:0;width:0}
.checkmark{position:absolute;top:50%;left:0;transform:translateY(-50%);height:18px;width:18px;background-color:rgba(10,25,47,.7);border:1.5px solid var(--cyan-400);border-radius:4px;box-shadow:0 0 5px rgba(0,242,255,.1);transition:all .2s ease}
.custom-checkbox-container:hover .checkmark{border-color:var(--cyan-300);box-shadow:0 0 8px rgba(0,242,255,.3)}
.custom-checkbox-container input:checked~.checkmark{background-color:rgba(0,242,255,.2);border-color:var(--cyan-300);box-shadow:0 0 10px rgba(0,242,255,.5)}
.checkmark:after{content:"";position:absolute;display:none}
.custom-checkbox-container input:checked~.checkmark:after{display:block}
.custom-checkbox-container .checkmark:after{left:5px;top:2px;width:5px;height:9px;border:solid var(--cyan-300);border-width:0 2px 2px 0;transform:rotate(45deg)}

.filter-row-top{display:flex;gap:20px;align-items:center;width:100%;flex-wrap:wrap;margin-bottom:10px}
.filter-row-bottom{display:flex;flex-direction:column;gap:8px;width:100%;align-items:flex-start}
.btn-toggle-filters{display:inline-flex;align-items:center;gap:var(--space-xs);background:rgba(10,25,47,.7);border:1.5px solid var(--cyan-400);border-radius:8px;color:var(--cyan-100);padding:10px 15px;font-size:14px;font-weight:var(--fw-semibold);cursor:pointer;transition:all .3s ease;box-shadow:0 0 10px rgba(0,242,255,.1);outline:none;height:max-content}
.btn-toggle-filters:hover,.btn-toggle-filters.active{background:rgba(0,242,255,.15);border-color:var(--cyan-300);color:var(--cyan-300);box-shadow:0 0 15px rgba(0,242,255,.4);transform:translateY(-2px)}
.collapsible-panel{animation:slideDown .3s ease-out}
.filter-label{font-size:14px;font-weight:bold;color:var(--cyan-300);text-transform:uppercase;letter-spacing:.5px}
.checkbox-group{display:flex;flex-wrap:wrap;gap:5px 12px;width:100%;background:rgba(10,25,47,.3);padding:10px 15px;border-radius:8px;border:1px solid rgba(53,201,252,.2)}

.tour-top-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-md);margin-bottom:var(--space-md);width:100%}
.tour-dropdown{position:relative;width:100%}
.tour-dropdown-btn,.tour-select-btn{display:flex;align-items:center;justify-content:space-between;width:100%;padding:14px 20px;background:rgba(10,25,47,.7);border:1.5px solid var(--cyan-400);border-radius:var(--border-radius-lg);color:var(--cyan-100);font-size:14px;font-weight:var(--fw-semibold);cursor:pointer;transition:all .3s ease;box-shadow:0 0 10px rgba(0,242,255,.1)}
.tour-dropdown-btn:hover,.tour-select-btn:hover{background:rgba(25,40,75,.8);border-color:var(--cyan-300);box-shadow:0 0 15px rgba(0,242,255,.2)}
.tour-dropdown-btn-content{display:flex;align-items:center;gap:var(--space-md)}
.tour-dropdown-btn-content i{font-size:20px;color:var(--cyan-300)}
.tour-dropdown-arrow{transition:transform .3s ease;font-size:14px;color:var(--neutral-400)}
.tour-dropdown.open .tour-dropdown-arrow{transform:rotate(180deg);color:var(--cyan-300)}
.tour-dropdown-menu{position:absolute;top:calc(100% + 8px);left:0;min-width:260px;width:max-content;max-width:calc(100vw - 40px);background:rgba(12,20,38,.98);border:1.5px solid var(--cyan-300);border-radius:var(--border-radius-lg);box-shadow:0 10px 25px rgba(0,0,0,.5),0 0 15px rgba(0,242,255,.2);padding:8px;z-index:150;display:none;flex-direction:column;gap:4px;max-height:250px;overflow-y:auto}
.tour-dropdown.open .tour-dropdown-menu{display:flex}
.tour-dropdown-menu .custom-checkbox-container{width:100%;padding:8px 8px 8px 34px;margin:0;border-radius:var(--border-radius-md);transition:all .2s ease}
.tour-dropdown-menu .custom-checkbox-container:hover{background:rgba(0,242,255,.1);color:var(--neutral-100)}
.tour-dropdown-menu .checkmark{left:8px}
.tour-select-btn{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300f2ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 20px center;background-size:16px;padding-right:44px;outline:none}
.tour-select-btn option{background-color:rgba(12,20,38,.98);color:var(--neutral-100)}
.tour-search-row{display:flex;align-items:center;justify-content:space-between;width:100%;gap:15px;margin-bottom:15px;flex-wrap:wrap}
.tour-search-wrapper{position:relative;flex:1;min-width:250px}
.tour-search-input{width:100%;padding:12px 16px 12px 42px;background:rgba(10,25,47,.7);border:1.5px solid var(--cyan-400);border-radius:var(--border-radius-lg);color:var(--cyan-100);font-size:14px;transition:all .3s ease;outline:none}
.tour-search-input:focus{border-color:var(--cyan-300);background:rgba(25,40,75,.95);box-shadow:0 0 20px rgba(0,242,255,.3)}
.tour-search-icon{position:absolute;left:16px;top:50%;transform:translateY(-50%);color:rgba(0,242,255,.5);font-size:18px;pointer-events:none}
.tour-switch-container{display:inline-flex;align-items:center;gap:10px;cursor:pointer;user-select:none;font-size:14px;color:var(--neutral-200);font-weight:var(--fw-medium)}
.tour-switch{position:relative;display:inline-block;width:44px;height:22px}
.tour-slider{position:absolute;cursor:pointer;inset:0;background-color:rgba(30,41,59,.8);border:1.5px solid rgba(0,242,255,.3);transition:.3s;border-radius:34px}
.tour-slider:before{position:absolute;content:"";height:14px;width:14px;left:3px;bottom:2.5px;background-color:var(--neutral-400);transition:.3s;border-radius:50%}
.tour-switch input:checked+.tour-slider{background-color:rgba(0,242,255,.2);border-color:var(--cyan-300)}
.tour-switch input:checked+.tour-slider:before{transform:translateX(20px);background-color:var(--cyan-300);box-shadow:0 0 8px var(--cyan-300)}

.rule-helper-link{color:var(--cyan-300);text-decoration:none;font-weight:600;border-bottom:1px dashed var(--cyan-300);transition:color .2s ease,border-bottom-color .2s ease}
.rule-helper-link:hover{color:var(--cyan-200);border-bottom:1px solid var(--cyan-200)}

.btn-switcher{background:rgba(10,25,47,.65);border:1.5px solid var(--cyan-400);border-radius:var(--border-radius-lg);color:var(--cyan-200);padding:10px 20px;font-size:14px;font-weight:var(--fw-semibold);cursor:pointer;transition:all .3s cubic-bezier(.4,0,.2,1);box-shadow:0 4px 10px rgba(0,242,255,.05);display:inline-flex;align-items:center;gap:8px;outline:none}
.btn-switcher:hover{background:rgba(0,242,255,.1);color:var(--cyan-100);border-color:var(--cyan-300);box-shadow:0 0 15px rgba(0,242,255,.25);transform:translateY(-2px)}
.btn-switcher.active{background:linear-gradient(135deg,rgba(0,102,204,.55) 0%,rgba(0,242,255,.55) 100%);color:#fff;border-color:var(--cyan-300);box-shadow:0 0 20px rgba(0,242,255,.4),inset 0 0 10px rgba(255,255,255,.1)}

.events-list-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px;margin-top:25px;animation:fadeIn .4s ease-out}
.event-list-card{background:radial-gradient(circle at top left,var(--color-bg-tertiary) 0%,var(--color-bg-primary) 100%);border:1.5px solid rgba(53,201,252,.3);border-radius:var(--border-radius-xl);padding:20px;display:flex;flex-direction:column;justify-content:space-between;gap:15px;transition:all .3s cubic-bezier(.4,0,.2,1);cursor:pointer;box-shadow:0 6px 15px rgba(0,0,0,.2),inset 0 0 10px rgba(0,242,255,.02);position:relative;overflow:hidden}
.event-list-card::before{content:'';position:absolute;top:0;left:0;width:100%;height:4px;background:linear-gradient(90deg,transparent,rgba(0,242,255,.5),transparent);transform:scaleX(0);transition:transform .4s ease}
.event-list-card:hover{transform:translateY(-5px);border-color:var(--cyan-400);box-shadow:0 12px 30px rgba(0,242,255,.2),inset 0 0 15px rgba(0,242,255,.05)}
.event-list-card:hover::before{transform:scaleX(1)}
.event-card-header{display:flex;gap:15px;align-items:flex-start}
.event-card-logo{flex-shrink:0;width:68px;height:68px;border-radius:var(--border-radius-md);background:rgba(10,25,47,.7);border:1.5px solid rgba(53,201,252,.4);display:flex;align-items:center;justify-content:center;overflow:hidden}
.event-card-logo img{width:85%;height:85%;object-fit:contain}
.event-card-title-group{display:flex;flex-direction:column;gap:6px;min-width:0}
.event-card-badges{display:flex;gap:6px;flex-wrap:wrap}
.event-card-title{font-size:1.15rem;color:var(--cyan-300);font-weight:var(--fw-bold);margin:0;line-height:1.3;text-shadow:0 0 4px rgba(0,242,255,.2)}
.event-card-details{display:flex;flex-direction:column;gap:10px;background:rgba(255,255,255,.015);padding:12px;border-radius:8px;border:1px solid rgba(53,201,252,.12)}
.event-card-detail-item{display:flex;align-items:flex-start;gap:8px;font-size:13.5px;color:var(--neutral-300);line-height:1.4}
.event-card-detail-item i{font-size:18px;color:var(--cyan-400);margin-top:1px;flex-shrink:0}
.event-card-detail-item strong{color:var(--cyan-300);font-weight:600}
.event-card-footer{display:flex;gap:10px;width:100%}
.event-card-footer .btn{flex:1;font-size:13px;height:38px}
.card-join-link{flex:1;text-decoration:none}

.badge-combined-premium{background:linear-gradient(135deg,rgba(16,185,129,.18) 0%,rgba(245,158,11,.18) 50%,rgba(239,68,68,.18) 100%);color:#34d399!important;border:1px dashed rgba(52,211,153,.6)!important;box-shadow:0 0 8px rgba(52,211,153,.2),inset 0 0 6px rgba(52,211,153,.08);position:relative;overflow:hidden;animation:premiumPulse 3s infinite ease-in-out}
.badge-pulse-dot,.badge-pulse-dot-prize{display:inline-block;width:5px;height:5px;background-color:#f59e0b;border-radius:50%;margin:0 4px;box-shadow:0 0 4px #f59e0b;vertical-align:middle}
.badge-pulse-dot{animation:pulseDot 1.5s infinite ease-in-out}
.badge-pulse-dot-prize{animation:pulseDotPrize 1.5s infinite ease-in-out}
@keyframes pulseDot{0%,100%{transform:scale(.8);opacity:.5}50%{transform:scale(1.2);opacity:1;box-shadow:0 0 6px #f59e0b}}
@keyframes pulseDotPrize{0%,100%{transform:scale(.8);opacity:.5}50%{transform:scale(1.2);opacity:1;box-shadow:0 0 6px #ef4444}}
@keyframes premiumPulse{0%,100%{border-color:rgba(52,211,153,.5);box-shadow:0 0 8px rgba(52,211,153,.2)}50%{border-color:rgba(245,158,11,.8);box-shadow:0 0 12px rgba(245,158,11,.4)}}
.badge-prize-combined-premium{background:linear-gradient(135deg,rgba(245,158,11,.18) 0%,rgba(239,68,68,.18) 100%);color:#f59e0b!important;border:1px dashed rgba(245,158,11,.6)!important;box-shadow:0 0 8px rgba(245,158,11,.25),inset 0 0 6px rgba(245,158,11,.1);position:relative;overflow:hidden;animation:prizePremiumPulse 3s infinite ease-in-out}
@keyframes prizePremiumPulse{0%,100%{border-color:rgba(245,158,11,.5);box-shadow:0 0 8px rgba(245,158,11,.2)}50%{border-color:rgba(239,68,68,.8);box-shadow:0 0 12px rgba(239,68,68,.4)}}

@media(max-width:768px){
    .month-title{font-size:18px;padding:12px}
    .calendar-wrapper{padding-bottom:10px}
    table{min-width:100%;font-size:85%}
    thead th{padding:10px 6px;font-size:.75em}
    tbody tr{min-height:90px}
    tbody td{padding:8px 6px;min-height:90px;border:1px solid rgba(47,185,255,.5)}
    .day-number{font-size:14px;margin-bottom:4px;padding:3px 0}
    .events-container{gap:3px;row-gap:3px;padding:3px 0}

    .cc-modal-dialog{width:min(95vw,500px);display:flex;flex-direction:column;grid-template-columns:unset;grid-template-rows:unset;padding:0}
    .cc-modal-banner-section{width:100%;flex:0 0 auto;min-height:unset;border-radius:16px 16px 0 0;border-bottom:1px solid rgba(47,185,255,.18)}
    .cc-modal-banner-section img{width:100%;height:auto;min-height:unset;max-height:220px}
    .cc-modal-content-wrapper{padding:1.5rem;min-width:unset;max-width:unset;width:100%}
    .btn-group{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:0 1.5rem 1.5rem}
    .btn-group a{display:block;width:100%}
    .btn{height:44px;font-size:13px;white-space:nowrap}
    .cc-modal-header-row{flex-direction:row;align-items:center;justify-content:flex-start;text-align:left;gap:1rem;margin-bottom:1rem;flex-wrap:wrap}
    .cc-modal-logo-box{flex:0 0 80px;width:80px;height:80px}
    .cc-modal-title-section{flex:1;min-width:0}
    .cc-modal-title-section h2{font-size:1.4rem}
    .cc-modal-info-section{grid-template-columns:1fr;gap:.75rem;margin:0 0 1.5rem;max-width:unset;width:100%}
    .cc-modal-close{right:1rem;top:1rem;width:2.2rem;height:2.2rem;font-size:1.2rem}

    .schedule-control-bar{flex-direction:column;align-items:stretch;gap:12px;padding:12px}
    .search-wrapper{max-width:none;width:100%}
    .control-input{height:36px!important}
    .control-group{width:100%;display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px}
    .tour-dropdown{flex:1 1 calc(60% - 5px);min-width:0}
    .tour-dropdown-btn.compact-btn{height:36px!important;padding:0 12px!important;box-sizing:border-box}
    .compact-switch-container{flex:0 0 auto;height:36px;display:flex;align-items:center}
    .segmented-control{flex:1 1 100%;height:36px!important;margin-top:4px}
    .segment-btn{flex:1;justify-content:center;height:100%!important;font-size:13px}

    .tour-top-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:12px}
    .tour-dropdown-btn,.tour-select-btn{padding:10px 14px;font-size:13px;border-radius:var(--border-radius-md)}
    .tour-dropdown-btn-content{gap:var(--space-xs)}
    .tour-dropdown-btn-content i{font-size:18px}
    .tour-dropdown-arrow{font-size:12px}
}

@media(max-width:480px){
    .btn-group{grid-template-columns:1fr;gap:8px}
    .events-list-grid{grid-template-columns:1fr;gap:15px}
}
</style>
<script src="/js/schedule.js"></script>
