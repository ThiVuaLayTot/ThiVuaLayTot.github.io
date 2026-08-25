---
layout: default
title: Các sự kiện của Thí Vua Lấy Tốt
permalink: /events/
---

<style>
.events-page { max-width: 1120px; margin: 0 auto; padding: 8px 16px 32px; }
.events-hero { max-width: 760px; margin: 0 auto 28px; text-align: center; }
.events-hero h1 { margin: 0 0 10px; font-size: clamp(2rem, 5vw, 3rem); line-height: 1.15; }
.events-hero h1 span { color: #48a6ff; }
.events-hero p { margin: 0; color: #aeb9c8; line-height: 1.7; }
.events-rss { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; margin-top: 14px; border: 1px solid rgba(72,166,255,.16); border-radius: 50%; background: rgba(8,12,25,.7); font-size: 20px; }
.events-rss:hover { text-decoration: none; border-color: rgba(72,166,255,.45); }
.events-actions { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px; margin: 0 0 42px; }
.events-action { display: flex; min-height: 72px; box-sizing: border-box; padding: 14px 16px; align-items: center; justify-content: center; gap: 9px; border: 1px solid rgba(72,166,255,.14); border-radius: 14px; background: rgba(8,12,25,.7); text-align: center; font-weight: 700; transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; }
.events-action:hover { text-decoration: none; transform: translateY(-2px); border-color: rgba(72,166,255,.4); box-shadow: 0 12px 28px rgba(0,0,0,.2); }
.events-action .bx { font-size: 21px; }
.events-section-title { margin: 0 0 18px; text-align: center; }
.events-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 18px; }
.event-card { display: flex; min-width: 0; overflow: hidden; flex-direction: column; border: 1px solid rgba(72,166,255,.14); border-radius: 16px; background: rgba(8,12,25,.72); box-shadow: 0 12px 32px rgba(0,0,0,.18); transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; }
.event-card:hover { transform: translateY(-3px); border-color: rgba(72,166,255,.4); box-shadow: 0 18px 38px rgba(0,0,0,.25); }
.event-card-image-link { display: block; aspect-ratio: 16 / 9; overflow: hidden; background: rgba(72,166,255,.05); }
.event-card-image { display: block; width: 100%; height: 100%; object-fit: cover; }
.event-card-content { display: flex; min-width: 0; padding: 17px; flex: 1; flex-direction: column; }
.event-card-meta { display: flex; flex-wrap: wrap; gap: 8px 14px; margin-bottom: 10px; color: #8996a8; font-size: .8rem; }
.event-card-title { margin: 0 0 8px; font-size: 1.08rem; line-height: 1.35; }
.event-card-description { margin: 0; color: #aeb9c8; font-size: .88rem; line-height: 1.55; }
.event-card-footer { display: flex; margin-top: auto; padding-top: 14px; align-items: center; justify-content: space-between; gap: 10px; font-size: .8rem; }
.event-card-tag { color: #48a6ff; font-weight: 700; }
.event-card-link { font-weight: 700; }
.events-empty { padding: 28px; border: 1px dashed rgba(72,166,255,.2); border-radius: 14px; color: #aeb9c8; text-align: center; }
.events-more { margin-top: 28px; text-align: center; }
.events-more a { display: inline-flex; padding: 10px 18px; align-items: center; gap: 7px; border-radius: 10px; background: rgba(72,166,255,.1); font-weight: 700; }
.events-more a:hover { text-decoration: none; background: rgba(72,166,255,.16); }
@media (max-width: 900px) { .events-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 680px) { .events-actions { grid-template-columns: 1fr; } .events-grid { grid-template-columns: 1fr; } .events-page { padding: 4px 10px 24px; } }
@media (prefers-reduced-motion: reduce) { .events-action, .event-card { transition: none; } }
</style>

<section class="events-page">
    <header class="events-hero">
        <h1>Các giải đấu, <span>sự kiện</span></h1>
        <p>Khám phá các giải đấu, hoạt động và sự kiện nổi bật của CLB Thí Vua Lấy Tốt.</p>
        <a class="events-rss" href="https://thivualaytot.github.io/atom.xml" aria-label="RSS các bài đăng" title="RSS"><span class="bx bx-rss" aria-hidden="true"></span></a>
    </header>

    <div class="events-actions">
        <a class="events-action" href="/schedule"><span class="bx bx-calendar" aria-hidden="true"></span>Lịch sự kiện</a>
        <a class="events-action" href="//chess.com/clubs/events/thi-vua-lay-tot-tungjohn-playing-chess?clubId=325849&ref_id=89365835"><span class="bx bx-trophy" aria-hidden="true"></span>Các giải khác trong CLB</a>
        <a class="events-action" href="/events/tournaments"><span class="bx bx-medal" aria-hidden="true"></span>Bảng tổng hợp giải đấu</a>
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
