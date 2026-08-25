---
layout: default
title: Bảng tổng kết các giải trong CLB Thí Vua Lấy Tốt
---

<style>
.tournaments-page { max-width: 1120px; margin: 0 auto; padding: 8px 16px 32px; }
.tournaments-hero { max-width: 760px; margin: 0 auto 40px; text-align: center; }
.tournaments-hero h1 { margin: 0 0 12px; font-size: clamp(2rem, 5vw, 3rem); line-height: 1.15; }
.tournaments-hero h1 span { color: #48a6ff; }
.tournaments-hero p { margin: 0; color: #aeb9c8; font-size: 1rem; line-height: 1.7; }
.tournaments-section + .tournaments-section { margin-top: 48px; }
.tournaments-section > h2 { margin: 0 0 20px; text-align: center; }
.tournament-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 18px; }
.tournament-card, .event-type-card { box-sizing: border-box; min-width: 0; border: 1px solid rgba(72,166,255,.14); border-radius: 16px; background: rgba(8,12,25,.72); box-shadow: 0 12px 32px rgba(0,0,0,.18); transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; }
.tournament-card:hover, .event-type-card:hover { transform: translateY(-3px); border-color: rgba(72,166,255,.4); box-shadow: 0 18px 38px rgba(0,0,0,.25); }
.tournament-card { display: grid; grid-template-columns: 96px minmax(0,1fr); align-items: center; gap: 20px; min-height: 190px; padding: 20px; }
.tournament-logo, .tournament-placeholder { width: 96px; height: 96px; box-sizing: border-box; }
.tournament-logo { display: block; object-fit: contain; }
.tournament-placeholder { display: grid; place-items: center; border: 1px solid rgba(72,166,255,.12); border-radius: 14px; background: rgba(72,166,255,.06); color: #48a6ff; font-size: 42px; }
.tournament-content { min-width: 0; }
.tournament-content h3 { margin: 0 0 8px; font-size: 1.08rem; line-height: 1.35; }
.tournament-content p { margin: 0; color: #aeb9c8; font-size: .88rem; line-height: 1.55; }
.tournament-organizer { margin-top: 10px; color: #8996a8; font-size: .82rem; }
.tournament-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.tournament-action { display: inline-flex; align-items: center; gap: 6px; padding: 7px 11px; border: 1px solid rgba(72,166,255,.2); border-radius: 10px; background: rgba(72,166,255,.08); color: inherit; font-size: .82rem; font-weight: 700; text-decoration: none; transition: border-color .2s ease, background .2s ease, transform .2s ease; }
.tournament-action:hover { transform: translateY(-1px); border-color: rgba(72,166,255,.42); background: rgba(72,166,255,.14); text-decoration: none; }
.event-types-grid { display: grid; grid-template-columns: repeat(5, minmax(0,1fr)); gap: 14px; }
.event-type-card { display: flex; min-height: 156px; padding: 18px 14px; flex-direction: column; align-items: center; justify-content: center; text-align: center; text-decoration: none; }
.event-type-card:hover { text-decoration: none; }
.event-type-icon { width: 54px; height: 54px; margin-bottom: 10px; object-fit: contain; }
.event-type-card h3 { margin: 0 0 8px; font-size: .98rem; line-height: 1.35; }
.event-type-card p { margin: 0; color: #aeb9c8; font-size: .82rem; line-height: 1.5; }
@media (max-width: 900px) { .event-types-grid { grid-template-columns: repeat(3, minmax(0,1fr)); } }
@media (max-width: 700px) { .tournament-grid { grid-template-columns: 1fr; } .tournaments-section + .tournaments-section { margin-top: 40px; } }
@media (max-width: 520px) {
    .tournaments-page { padding: 4px 10px 24px; }
    .tournament-card { grid-template-columns: 72px minmax(0,1fr); gap: 14px; min-height: 0; padding: 16px; }
    .tournament-logo, .tournament-placeholder { width: 72px; height: 72px; }
    .tournament-placeholder { font-size: 32px; }
    .tournament-actions { gap: 7px; }
    .tournament-action { padding: 7px 9px; font-size: .78rem; }
    .event-types-grid { grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; }
    .event-type-card { min-height: 140px; padding: 14px 10px; }
}
@media (prefers-reduced-motion: reduce) { .tournament-card, .event-type-card, .tournament-action { transition: none; } }
</style>

<section class="tournaments-page">
    <header class="tournaments-hero">
        <h1>Các giải trong CLB <span>Thí Vua Lấy Tốt</span></h1>
        <p>Tổng hợp các hệ thống giải đấu và những thể loại cờ vua đã được tổ chức trong CLB.</p>
    </header>
    <section class="tournaments-section">
        <h2>Hệ thống giải đấu</h2>
        <div class="tournament-grid">
            <div class="tournament-card">
                <img class="tournament-logo" src="/images/tvltlogo.png" alt="TVLT" title="Thí Vua Lấy Tốt">
                <div class="tournament-content">
                    <h3>Thí Vua Lấy Tốt</h3>
                    <p>Siêu giải Thí Vua Lấy Tốt được tổ chức có thưởng và được phát trực tiếp.</p>
                    <div class="tournament-organizer">Tổ chức bởi <a href="/leaders#owner">Mr.TungJohn</a></div>
                    <div class="tournament-actions">
                        <a class="tournament-action" href="/events/tournaments/tvlt">Bảng tổng kết <span aria-hidden="true">→</span></a>
                        <a class="tournament-action" href="/events/tvlt-thi-vua-lay-tot">Thông tin sự kiện <span aria-hidden="true">↗</span></a>
                    </div>
                </div>
            </div>
            <div class="tournament-card">
                <img class="tournament-logo" src="/images/events/logo/cttq.png" alt="CTTQ" title="Chiến Trường Thí Quân">
                <div class="tournament-content">
                    <h3>Chiến Trường Thí Quân</h3>
                    <p>Sự kiện Chiến Trường Thí Quân với giải thưởng <a href="https://chess.com/membership">1 tháng Chess.com Diamond Membership</a>.</p>
                    <div class="tournament-organizer">Tổ chức bởi <a href="/leaders#admin3">M-DinhHoangViet</a></div>
                    <div class="tournament-actions">
                        <a class="tournament-action" href="/events/tournaments/cttq">Bảng tổng kết <span aria-hidden="true">→</span></a>
                        <a class="tournament-action" href="/events/cttq-chien-truong-thi-quan">Thông tin sự kiện <span aria-hidden="true">↗</span></a>
                    </div>
                </div>
            </div>
            <div class="tournament-card">
                <img class="tournament-logo" src="/images/events/logo/cbtt-superblitz.png" alt="CBTT" title="Cờ Bí Thí Tốt">
                <div class="tournament-content">
                    <h3>Cờ Bí Thí Tốt</h3>
                    <p>Bao gồm các thể thức Rapid, Blitz, SuperBlitz, Bullet và Chess960.</p>
                    <div class="tournament-organizer">Tổ chức bởi <a href="/leaders#admin4">VN-SenJin</a></div>
                    <div class="tournament-actions">
                        <a class="tournament-action" href="/events/tournaments/cbtt">Bảng tổng kết <span aria-hidden="true">→</span></a>
                        <a class="tournament-action" href="/events/cbtt-co-bi-thi-tot">Thông tin sự kiện <span aria-hidden="true">↗</span></a>
                    </div>
                </div>
            </div>
            <div class="tournament-card">
                <div class="tournament-placeholder" aria-hidden="true"><span class="bx bx-trophy"></span></div>
                <div class="tournament-content">
                    <h3>Đấu Trường Thí Vua</h3>
                    <p>Một hệ thống giải đấu do quản trị viên CLB tổ chức.</p>
                    <div class="tournament-organizer">Tổ chức bởi <a href="/leaders#admin2">FR-CH_TheClanTeamIsMine</a></div>
                    <div class="tournament-actions">
                        <a class="tournament-action" href="/events/tournaments/dttv">Bảng tổng kết <span aria-hidden="true">→</span></a>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <section class="tournaments-section">
        <h2>Các thể loại giải đấu khác</h2>
        <div class="event-types-grid">
            <a class="event-type-card" href="https://chess.com/clubs/events/thi-vua-lay-tot-tungjohn-playing-chess?clubId=325849&ref_id=89365835&cid=325849" target="_blank" rel="noopener noreferrer">
                <img class="event-type-icon" src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/VN-SenJin/phpkp4hguhbq2as714LLnI.png" alt="Daily Chess Matches">
                <h3>Daily Chess</h3>
                <p>Trận đấu Daily Chess</p>
            </a>
            <a class="event-type-card" href="https://chess.com/clubs/events/thi-vua-lay-tot-tungjohn-playing-chess?clubId=325849&ref_id=89365835&cid=325849" target="_blank" rel="noopener noreferrer">
                <img class="event-type-icon" src="https://chess.com/bundles/web/images/color-icons/tournaments.3a561883.svg" alt="Swiss Tournament">
                <h3>Swiss Tournament</h3>
                <p>Giải đấu hệ Thụy Sĩ</p>
            </a>
            <a class="event-type-card" href="https://chess.com/clubs/events/thi-vua-lay-tot-tungjohn-playing-chess?clubId=325849&ref_id=89365835&cid=325849" target="_blank" rel="noopener noreferrer">
                <img class="event-type-icon" src="https://chess.com/bundles/web/images/color-icons/arena-club-multi.b56c9ae4.svg" alt="Multi-Club Arena">
                <h3>Multi-Club Arena</h3>
                <p>Đấu trường đa CLB</p>
            </a>
            <a class="event-type-card" href="https://chess.com/clubs/events/thi-vua-lay-tot-tungjohn-playing-chess?clubId=325849&ref_id=89365835&cid=325849" target="_blank" rel="noopener noreferrer">
                <img class="event-type-icon" src="https://chess.com/bundles/web/images/color-icons/clipboard-vote.svg" alt="Vote Chess">
                <h3>Vote Chess</h3>
                <p>Cờ vua bỏ phiếu</p>
            </a>
            <a class="event-type-card" href="https://chess.com/clubs/events/thi-vua-lay-tot-tungjohn-playing-chess?clubId=325849&ref_id=89365835&cid=325849" target="_blank" rel="noopener noreferrer">
                <img class="event-type-icon" src="https://chess.com/bundles/web/images/color-icons/arena-club.495ffa75.svg" alt="Arena">
                <h3>Arena</h3>
                <p>Giải đấu Arena</p>
            </a>
        </div>
    </section>
</section>
