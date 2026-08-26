---
layout: default
title: Các thông báo quan trọng và các bài đăng nổi bật
---

<h1 class="title">Các thông báo quan trọng và các bài đăng nổi bật</h1>
<p align="right"><a href="https://thivualaytot.github.io/atom.xml"><span class="bx bx-rss" title="Atom RSS"></span></a></p>
<ul class="nav-tabs">
    <li><a href="/blog" class="active"><span class="bx bxs-news"></span>Tất cả bài đăng</a></li>
    <li><a href="/chess"><span class="bx bxs-chess"></span>Kiến thức cờ vua</a></li>
    <li><a href="/news"><span class="bx bx-news"></span>Thông báo/Tin tức</a></li>
    <li><a href="/events"><span class="bx bx-medal"></span>Sự kiện/Giải đấu</a></li>
</ul><br>
<section class="category-card-list">
    {% for post in site.posts %}
    <article class="category-card">
        <div class="category-card__image-container">
            <a href="{{ post.url }}" title="{{ post.title }}"><img src="/images/{{ post.id }}.png" class="category-card__image"></a>
        </div>
        <div class="category-card__content">
            <div class="post_in4">
                <div class="category-card__detail">
                    <b class="category-card__author"><span class="bx bx-user"></span>{{ post.author }}</b><span class="category-card__date"><span class="bx bx-time"></span><span>{{ post.date | date:"%d thg %m, %Y" }}</span></span>
                </div>
            </div>
            <a href="{{ post.url }}"><h4 class="category-card__title">{{ post.title }}</h4></a>
            <i class="category-card__description">{{ post.description }}</i>
            <span class="category-card__tag"><a href="/{{ post.category }}"><span class="bx bx-purchase-tag-alt"></span><span style="display: inline-block">{{ post.tags }}</span></a></span>
        </div>
    </article>
{% endfor %}
</section>

<h2>Các bài đăng khác</h2>
<div class="category-card-list">
    <article class="category-card">
        <div class="category-card__image-container">
            <a href="https://chess.com/news/quy-dinh-cua-clb-tungjohn-playing-chess-7-2024" target="_blank"><img src="https://images.chesscomfiles.com/uploads/v1/news/1447745.59c40bc3.668x375o.d96fb1f62f12.png" class="category-card__image"></a>
        </div>
        <div class="category-card__content">
            <a href="https://chess.com/news/quy-dinh-cua-clb-tungjohn-playing-chess-7-2024" target="_blank"><h4 class="category-card__title">Luật câu lạc bộ Thí Vua Lấy Tốt chính thức</h4></a>
            <i class="category-card__description">Quy định chính thức của câu lạc bộ Thí Vua Lấy Tốt.</i>
            <div class="category-card__detail">
                <b class="category-card__author"><span class="bx bx-user"></span>Các quản trị viên</b>
                <span class="category-card__date"><span class="bx bx-time"></span>25 thg 7, 2024</span>
            </div>
            <span class="category-card__tag"><a href="/news"><span class="bx bx-purchase-tag-alt"></span>Quy định</a></span>
        </div>
    </article>
    <article class="category-card">
        <div class="category-card__image-container">
            <a href="https://chess.com/news/luat-choi-cong-bang-cua-clb-thi-vua-lay-tot" target="_blank"><img src="/images/tvlt/tvlt_bg.jpg" class="category-card__image"></a>
        </div>
        <div class="category-card__content">
            <a href="https://chess.com/news/luat-choi-cong-bang-cua-clb-thi-vua-lay-tot" target="_blank"><h4 class="category-card__title">Chính sách Chơi Công Bằng chính thức của Thí Vua Lấy Tốt</h4></a>
            <i class="category-card__description">Quy định Fair Play trong các sự kiện của câu lạc bộ Thí Vua Lấy Tốt.</i>
            <div class="category-card__detail">
                <b class="category-card__author"><span class="bx bx-user"></span>Các quản trị viên</b>
                <span class="category-card__date"><span class="bx bx-time"></span>5 thg 3, 2024</span>
            </div>
            <span class="category-card__tag"><a href="/news"><span class="bx bx-purchase-tag-alt"></span>Quy định</a></span>
        </div>
    </article>
</div>