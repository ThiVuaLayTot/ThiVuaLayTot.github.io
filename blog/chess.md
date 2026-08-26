---
layout: default
title: Kiến thức cờ vua
permalink: /chess/
---

<h1 class="title">Các kiến thức cờ vua</h1>
<p align="right"><a href="https://thivualaytot.github.io/atom.xml"><span class="bx bx-rss" title="Atom RSS"></span></a></p>
<ul class="nav-tabs">
    <li><a href="/blog"><span class="bx bxs-news"></span>Tất cả bài đăng</a></li>
    <li><a href="/chess" class="active"><span class="bx bxs-chess"></span>Kiến thức cờ vua</a></li>
    <li><a href="/news"><span class="bx bx-news"></span>Thông báo/Tin tức</a></li>
    <li><a href="/events"><span class="bx bx-medal"></span>Sự kiện/Giải đấu</a></li>
</ul><br>
<section class="category-card-list">
    {% for post in site.posts %} {% if post.category == "chess" %}
    <article class="category-card">
        <a href="{{ post.url }}" title="{{ post.title }}"><img src="/images/{{ post.id }}.png" class="category-card__image"></a>
        <div class="category-card__content">
            <div class="post_in4">
                <div class="category-card__detail">
                    <b class="category-card__author"><span class="bx bx-user"></span>{{ post.author }}</b><span class="category-card__date"><span class="bx bx-time"></span><span>{{ post.date | date:"%d thg %m, %Y" }}</span></span>
                </div>
            </div>
            <a href="{{ post.url }}"><h4 class="category-card__title">{{ post.title }}</h4></a>
            <i class="category-card__description">{{ post.description }}</i>
            <span class="category-card__tag"><a href="{{ post.category }}"><span class="bx bx-purchase-tag-alt"></span><span style="display: inline-block">{{ post.tags }}</span></a></span>
        </div>
    </article>
{% endif %} {% endfor %}
</section>
<div class="main"><a href="/blog"><span class="btn">Đọc thêm</span></a></div>