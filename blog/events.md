---
layout: default
title: Các sự kiện và giải đấu
permalink: /events/
---

<link rel="stylesheet" type="text/css" href="/css/events.css">

<header class="events-hero">
    <h1 class="page-title">Các giải đấu, sự kiện</h1>
    <p class="page-decription">Khám phá các giải đấu, hoạt động và sự kiện nổi bật của CLB Thí Vua Lấy Tốt.
        <a href="https://thivualaytot.github.io/atom.xml" aria-label="RSS các bài đăng" title="Atom RSS"><span class="bx bx-rss" aria-hidden="true"></span></a>
    </p>
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
    <div class="category-card-list events-grid">
        {% assign event_posts = site.posts | where: "category", "events" | sort: "date" %}
        {% for post in event_posts %}
        <article class="category-card">
            <a href="{{ post.url }}" title="{{ post.title }}"><img src="/images/{{ post.id }}.png" class="category-card__image"></a>
            <div class="category-card__content">
                <div class="post_in4">
                    <div class="category-card__detail">
                        <b class="category-card__author"><span class="bx bx-user"></span>{{ post.author }}</b>
                        <span class="category-card__date"><span class="bx bx-time"></span><span>{{ post.date | date:"%d thg %m, %Y" }}</span></span>
                    </div>
                </div>
                <a href="{{ post.url }}"><h4 class="category-card__title">{{ post.title }}</h4></a>
                <i class="category-card__description">{{ post.description }}</i>
                <div class="category-card__footer">
                    <span class="category-card__tag"><span class="bx bx-purchase-tag-alt" aria-hidden="true"></span> {{ post.tags }}</span>
                    <a class="category-card__link" href="{{ post.url }}">Xem chi tiết <span aria-hidden="true">→</span></a>
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
