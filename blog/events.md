---
layout: default
title: Các sự kiện của Thí Vua Lấy Tốt
permalink: /events/
---

<style>
.events-page { max-width: 1120px; margin: 0 auto; padding: 8px 16px 32px; }
.events-hero { max-width: 760px; margin: 0 auto 40px; text-align: center; }
.events-hero h1 { margin: 0 0 12px; font-size: clamp(2rem, 5vw, 3rem); line-height: 1.15; }
.events-hero h1 span { color: #48a6ff; }
.events-hero p { margin: 0; color: #aeb9c8; font-size: 1rem; line-height: 1.7; }
.events-rss { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; margin-top: 14px; border: 1px solid rgba(72,166,255,.16); border-radius: 50%; background: rgba(8,12,25,.7); color: inherit; font-size: 20px; transition: border-color .2s ease, background .2s ease, transform .2s ease; }
.events-rss:hover { text-decoration: none; transform: translateY(-2px); border-color: rgba(72,166,255,.45); background: rgba(72,166,255,.08); }
.events-actions { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 16px; margin-bottom: 48px; }
.events-action { position: relative; display: grid; min-height: 126px; box-sizing: border-box; padding: 20px; grid-template-columns: 58px minmax(0,1fr); grid-template-rows: auto 1fr auto; column-gap: 15px; align-items: start; overflow: hidden; border: 1px solid rgba(72,166,255,.15); border-radius: 20px; background: linear-gradient(145deg, rgba(18,27,49,.9), rgba(8,12,25,.78)); color: inherit; text-align: left; box-shadow: 0 14px 34px rgba(0,0,0,.2); transition: transform .22s ease, border-color .22s ease, box-shadow .22s ease, background .22s ease; isolation: isolate; }
.events-action::before { position: absolute; inset: 0; z-index: -2; background: radial-gradient(circle at 12% 12%, rgba(72,166,255,.18), transparent 38%), radial-gradient(circle at 100% 100%, rgba(72,166,255,.08), transparent 42%); content: ""; }
.events-action::after { position: absolute; right: -48px; bottom: -58px; z-index: -1; width: 150px; height: 150px; border: 1px solid rgba(72,166,255,.08); border-radius: 50%; box-shadow: 0 0 0 18px rgba(72,166,255,.025), 0 0 0 38px rgba(72,166,255,.015); content: ""; pointer-events: none; }
.events-action:hover { text-decoration: none; transform: translateY(-5px); border-color: rgba(72,166,255,.48); background: linear-gradient(145deg, rgba(22,38,68,.96), rgba(8,12,25,.86)); box-shadow: 0 22px 46px rgba(0,0,0,.3), 0 0 28px rgba(72,166,255,.08); }
.events-action-icon { position: relative; display: flex; width: 58px; height: 58px; grid-row: 1 / 4; align-items: center; justify-content: center; border: 1px solid rgba(72,166,255,.28); border-radius: 17px; background: linear-gradient(145deg, rgba(72,166,255,.18), rgba(72,166,255,.05)); color: #48a6ff; font-size: 27px; box-shadow: inset 0 1px 0 rgba(255,255,255,.06), 0 8px 20px rgba(0,0,0,.16); }
.events-action-icon::after { position: absolute; inset: 5px; border: 1px solid rgba(255,255,255,.05); border-radius: 12px; content: ""; }
.events-action-label { align-self: end; color: #7f91a8; font-size: .68rem; font-weight: 800; letter-spacing: .12em; line-height: 1.2; text-transform: uppercase; }
.events-action-title { align-self: start; margin-top: 4px; font-size: 1.02rem; font-weight: 750; line-height: 1.35; }
.events-action-arrow { display: inline-flex; width: 30px; height: 30px; margin-top: 13px; align-items: center; justify-content: center; grid-column: 2; justify-self: start; border: 1px solid rgba(72,166,255,.18); border-radius: 50%; background: rgba(72,166,255,.07); color: #48a6ff; font-size: 16px; transition: transform .22s ease, background .22s ease, border-color .22s ease; }
.events-action:hover .events-action-arrow { transform: translateX(5px); border-color: rgba(72,166,255,.4); background: rgba(72,166,255,.14); }
.events-section-title { margin: 0 0 20px; text-align: center; }
.events-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 18px; }
.event-card { display: flex; min-width: 0; overflow: hidden; flex-direction: column; border: 1px solid rgba(72,166,255,.14); border-radius: 16px; background: rgba(8,12,25,.72); box-shadow: 0 12px 32px rgba(0,0,0,.18); transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; }
.event-card:hover { transform: translateY(-3px); border-color: rgba(72,166,255,.4); box-shadow: 0 18px 38px rgba(0,0,0,.25); }
.event-card-image-link { display: block; aspect-ratio: 16 / 9; overflow: hidden; background: rgba(72,166,255,.05); }
.event-card-image { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .25s ease; }
.event-card:hover .event-card-image { transform: scale(1.02); }
.event-card-content { display: flex; min-width: 0; flex: 1; padding: 18px; flex-direction: column; }
.event-card-meta { display: flex; flex-wrap: wrap; gap: 8px 14px; margin-bottom: 10px; color: #8996a8; font-size: .8rem; }
.event-card-title { margin: 0 0 8px; font-size: 1.08rem; line-height: 1.35; }
.event-card-description { margin: 0; color: #aeb9c8; font-size: .88rem; line-height: 1.55; }
.event-card-footer { display: flex; margin-top: auto; padding-top: 16px; align-items: center; justify-content: space-between; gap: 10px; font-size: .8rem; }
.event-card-tag { min-width: 0; overflow: hidden; color: #48a6ff; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.event-card-link { flex: none; font-weight: 700; }
.events-empty { grid-column: 1 / -1; padding: 28px; border: 1px dashed rgba(72,166,255,.2); border-radius: 14px; color: #aeb9c8; text-align: center; }
.events-more { margin-top: 28px; text-align: center; }
.events-more a { display: inline-flex; padding: 10px 18px; align-items: center; gap: 7px; border: 1px solid rgba(72,166,255,.14); border-radius: 10px; background: rgba(72,166,255,.08); font-weight: 700; }
.events-more a:hover { text-decoration: none; border-color: rgba(72,166,255,.3); background: rgba(72,166,255,.14); }
@media (max-width: 900px) { .events-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 700px) { .events-actions { grid-template-columns: 1fr; gap: 12px; margin-bottom: 40px; } .events-action { min-height: 104px; } .events-grid { grid-template-columns: 1fr; } }
@media (max-width: 520px) { .events-page { padding: 4px 10px 24px; } .events-action { min-height: 98px; grid-template-columns: 48px minmax(0,1fr); column-gap: 13px; padding: 15px; } .events-action-icon { width: 48px; height: 48px; border-radius: 14px; font-size: 23px; } .events-action-label { font-size: .64rem; } .events-action-title { font-size: .94rem; } .events-action-arrow { width: 27px; height: 27px; margin-top: 9px; } .event-card-content { padding: 16px; } .event-card-footer { align-items: flex-start; flex-direction: column; } }
@media (prefers-reduced-motion: reduce) { .events-rss, .events-action, .events-action-arrow, .event-card, .event-card-image { transition: none; } }
</style>

<section class="events-page">
    <header class="events-hero">
        <h1>Các giải đấu, <span>sự kiện</span></h1>
        <p>Khám phá các giải đấu, hoạt động và sự kiện nổi bật của CLB Thí Vua Lấy Tốt.</p>
        <a class="events-rss" href="https://thivualaytot.github.io/atom.xml" aria-label="RSS các bài đăng" title="RSS"><span class="bx bx-rss" aria-hidden="true"></span></a>
    </header>

    <div class="events-actions">
        <a class="events-action" href="/schedule">
            <span class="events-action-icon"><span class="bx bx-calendar" aria-hidden="true"></span></span>
            <span class="events-action-label">Lịch</span>
            <span class="events-action-title">Lịch sự kiện</span>
            <span class="events-action-arrow" aria-hidden="true">→</span>
        </a>
        <a class="events-action" href="//chess.com/clubs/events/thi-vua-lay-tot-tungjohn-playing-chess?clubId=325849&ref_id=89365835">
            <span class="events-action-icon"><span class="bx bx-trophy" aria-hidden="true"></span></span>
            <span class="events-action-label">Chess.com</span>
            <span class="events-action-title">Các giải khác trong CLB</span>
            <span class="events-action-arrow" aria-hidden="true">→</span>
        </a>
        <a class="events-action" href="/events/tournaments">
            <span class="events-action-icon"><span class="bx bx-medal" aria-hidden="true"></span></span>
            <span class="events-action-label">Tổng hợp</span>
            <span class="events-action-title">Bảng tổng hợp giải đấu</span>
            <span class="events-action-arrow" aria-hidden="true">→</span>
        </a>
    </div>

    <section>
        <h2 class="events-section-title">Sự kiện của Thí Vua Lấy Tốt</h2>
        <div class="events-grid">
            {% assign event_posts = site.posts | where: "category", "events" | sort: "date" | reverse %}
            {% for post in event_posts %}
            <div class="event-card">
                <a class="event-card-image-link" href="{{ post.url }}" title="{{ post.title }}">
                    <img class="event-card-image" src="/images/{{ post.id }}.png" alt="{{ post.title }}" loading="lazy">
                </a>
                <div class="event-card-content">
                    <div class="event-card-meta">
                        <span><span class="bx bx-user" aria-hidden="true"></span> {{ post.author }}</span>
                        <span><span class="bx bx-time" aria-hidden="true"></span> {{ post.date | date:"%d/%m/%Y" }}</span>
                    </div>
                    <a href="{{ post.url }}"><h3 class="event-card-title">{{ post.title }}</h3></a>
                    {% if post.description %}<p class="event-card-description">{{ post.description }}</p>{% endif %}
                    <div class="event-card-footer">
                        <span class="event-card-tag"><span class="bx bx-purchase-tag-alt" aria-hidden="true"></span> {{ post.tags }}</span>
                        <a class="event-card-link" href="{{ post.url }}">Xem chi tiết <span aria-hidden="true">→</span></a>
                    </div>
                </div>
            </div>
            {% else %}
            <div class="events-empty">Chưa có sự kiện nào được đăng.</div>
            {% endfor %}
        </div>
    </section>

    <div class="events-more">
        <a href="/blog"><span class="bx bx-news" aria-hidden="true"></span> Xem tất cả bài đăng</a>
    </div>
</section>
