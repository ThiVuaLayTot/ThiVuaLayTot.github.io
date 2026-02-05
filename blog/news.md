---
layout: default
title: Thông báo và tin tức
permalink: /news/
---

<h1 class="title">Thông báo & Tin tức</h1>
<p align="right"><a href="https://thivualaytot.github.io/atom.xml"><span class="bx bx-rss" title="Atom RSS"></span></a></p>
<ul class="tab">
    <li><a href="/blog"><span class="bx bxs-news"></span>Tất cả bài đăng</a></li>
    <li><a href="/chess"><span class="bx bxs-chess"></span>Kiến thức cờ vua</a></li>
    <li><a href="/news" class="active"><span class="fa fa-newspaper"></span>Thông báo/Tin tức</a></li>
    <li><a href="/events"><span class="fa fa-medal"></span>Sự kiện/Giải đấu</a></li>
</ul><br>
<section class="card-list">
    {% for post in site.posts %} {% if post.category == "news" %}
    <article class="card">
        <a href="{{ post.url }}" title="{{ post.title }}"><img src="/images/{{ post.id }}.png" class="card_image"></a>
        <div class="post_in4">
            <div class="card_detail">
            <b class="card_author"><span class="bx bx-user"></span>{{ post.author }}</b><span class="card_date"><span class="bx bx-time"></span><span>{{ post.date | date:"%d thg %m, %Y" }}</span></span>
            </div>
        </div>
        <a href="{{ post.url }}"><h4 class="card_title">{{ post.title }}</h4></a>
        <i class="card_in4">{{ post.description }}</i>
        <span class="card_tag"><a href="\{{ post.category }}"><span class="fa fa-tag"></span><span style="display: inline-block">{{ post.tags }}</span></a></span>
    </article>
{% endif %} {% endfor %}
</section>