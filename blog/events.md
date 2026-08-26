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
.events-actions { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 16px; margin-bottom: 48px; }
.events-action { display: grid; min-height: 92px; box-sizing: border-box; padding: 18px 6px; grid-template-columns: 42px minmax(0,1fr) 24px; column-gap: 13px; align-items: center; border: 0; color: inherit; text-align: left; text-decoration: none; }
.events-action:hover { text-decoration: none; }
.events-action-icon { display: flex; width: 42px; height: 42px; align-items: center; justify-content: center; color: #48a6ff; font-size: 27px; }
.events-action-label { margin-bottom: 3px; color: #7f91a8; font-size: .68rem; font-weight: 800; letter-spacing: .12em; line-height: 1.2; text-transform: uppercase; }
.events-action-title { display: block; font-size: 1rem; font-weight: 750; line-height: 1.35; }
.events-action-arrow { display: flex; width: 24px; height: 24px; align-items: center; justify-content: center; color: #48a6ff; font-size: 17px; transition: transform .2s ease; }
.events-action:hover .events-action-arrow { transform: translateX(4px); }
.events-section-title { margin: 0 0 20px; text-align: center; }
.card-footer { display: flex; margin-top: auto; padding-top: 16px; align-items: center; justify-content: space-between; gap: 10px; font-size: .8rem; }
.card-tag { min-width: 0; overflow: hidden; color: #48a6ff; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.card-link { flex: none; font-weight: 700; }
.events-empty { grid-column: 1 / -1; padding: 28px; border: 1px dashed rgba(72,166,255,.2); border-radius: 14px; color: #aeb9c8; text-align: center; }
.events-more { margin-top: 28px; text-align: center; }
.events-more a { display: inline-flex; padding: 10px 18px; align-items: center; gap: 7px; border: 1px solid rgba(72,166,255,.14); border-radius: 10px; background: rgba(72,166,255,.08); font-weight: 700; }
.events-more a:hover { text-decoration: none; border-color: rgba(72,166,255,.3); background: rgba(72,166,255,.14); }
@media (max-width: 900px) { .events-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 700px) { .events-actions { grid-template-columns: 1fr; gap: 6px; margin-bottom: 40px; } .events-action { min-height: 76px; padding: 12px 4px; } .events-grid { grid-template-columns: 1fr; } }
@media (max-width: 520px) { .events-page { padding: 4px 10px 24px; } .events-action { grid-template-columns: 38px minmax(0,1fr) 22px; column-gap: 10px; min-height: 68px; } .events-action-icon { width: 38px; height: 38px; font-size: 23px; } .events-action-label { font-size: .64rem; } .events-action-title { font-size: .94rem; } .event-card-content { padding: 16px; } .event-card-footer { align-items: flex-start; flex-direction: column; } }
@media (prefers-reduced-motion: reduce) { .events-rss, .events-action-arrow, .event-card, .event-card-image { transition: none; } }
</style>

<section class="events-page">
    <header class="events-hero">
        <h1>Các giải đấu, sự kiện</h1>
        <p>Khám phá các giải đấu, hoạt động và sự kiện nổi bật của CLB Thí Vua Lấy Tốt. 
        <a href="https://thivualaytot.github.io/atom.xml" aria-label="RSS các bài đăng" title="Atom RSS"><span class="bx bx-rss" aria-hidden="true"></span></a></p>
    </header>
    <div class="events-actions">
        <a class="events-action" href="/schedule">
            <span class="events-action-icon"><span class="bx bx-calendar" aria-hidden="true"></span></span>
            <span><span class="events-action-label">Lịch</span><span class="events-action-title">Lịch sự kiện</span></span>
            <span class="events-action-arrow" aria-hidden="true">→</span>
        </a>
        <a class="events-action" href="//chess.com/clubs/events/thi-vua-lay-tot-tungjohn-playing-chess?clubId=325849&ref_id=89365835">
            <span class="events-action-icon"><span class="bx bx-trophy" aria-hidden="true"></span></span>
            <span><span class="events-action-label">Chess.com</span><span class="events-action-title">Các giải khác trong CLB</span></span>
            <span class="events-action-arrow" aria-hidden="true">→</span>
        </a>
        <a class="events-action" href="/events/tournaments">
            <span class="events-action-icon"><span class="bx bx-medal" aria-hidden="true"></span></span>
            <span><span class="events-action-label">Tổng hợp</span><span class="events-action-title">Các giải đấu đã tổ chức</span></span>
            <span class="events-action-arrow" aria-hidden="true">→</span>
        </a>
    </div>
    <section>
        <div class="events-grid">
            {% assign event_posts = site.posts | where: "category", "events" | sort: "date" %}
            {% for post in event_posts %}
            <article class="card">
                <a href="{{ post.url }}" title="{{ post.title }}"><img src="/images/{{ post.id }}.png" class="card_image"></a>
                <div class="card_content">
                    <div class="post_in4">
                        <div class="card_detail">
                            <b class="card_author"><span class="bx bx-user"></span>{{ post.author }}</b><span class="card_date"><span class="bx bx-time"></span><span>{{ post.date | date:"%d thg %m, %Y" }}</span></span>
                        </div>
                    </div>
                    <a href="{{ post.url }}"><h4 class="card_title">{{ post.title }}</h4></a>
                    <i class="card_in4">{{ post.description }}</i>
                    <div class="card-footer">
                        <span class="card-tag"><span class="bx bx-purchase-tag-alt" aria-hidden="true"></span> {{ post.tags }}</span>
                        <a class="card-link" href="{{ post.url }}">Xem chi tiết <span aria-hidden="true">→</span></a>
                    </div>
                </div>
            </article>
            {% else %}
            <div class="events-empty">Chưa có sự kiện nào được đăng.</div>
            {% endfor %}
        </div>
    </section>
    <div class="events-more">
        <a href="/blog"><span class="bx bx-news" aria-hidden="true"></span> Xem tất cả bài đăng</a>
    </div>
</section>
