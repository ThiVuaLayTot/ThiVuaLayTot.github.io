---
layout: default
title: Các sự kiện và giải đấu
permalink: /events/
---

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
<style>
.category-card-list {
  display: grid;
  gap: var(--space-2xl);
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
@media (min-width: 1024px) {
  .category-card-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
.category-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 100%;
  box-shadow: var(--shadow-xl);
  position: relative;
  direction: ltr;
  padding: 0;
  margin-bottom: var(--space-lg);
  border-radius: var(--border-radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(13, 18, 30, 0.4);
  backdrop-filter: blur(24px) saturate(200%);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  transform: translateY(0);
  transition: var(--transition-slow);
  overflow: hidden;
}
.category-card:hover {
  box-shadow:
    0 30px 60px -12px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(56, 189, 248, 0.1);
  border-color: var(--color-accent);
  background: rgba(15, 23, 42, 0.6);
  transform: translateY(-12px) scale(1.01);
}
.category-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--gradient-accent);
  opacity: 0;
  transition: var(--transition-base);
  z-index: 2;
}
.category-card:hover::before {
  opacity: 1;
}
.category-card__content {
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  box-sizing: border-box;
}
.category-card__image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 0;
  position: relative;
  background-size: cover;
  transition: transform var(--transition-base);
}
.category-card:hover .category-card__image {
  transform: scale(1.05);
}
.category-card__title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-top: 0;
  margin-bottom: var(--space-sm);
  font-weight: var(--fw-bold);
  font-size: var(--fs-lg);
  color: var(--green-400);
  transition: color var(--transition-base);
  line-height: 1.4;
}
.category-card:hover .category-card__title {
  color: var(--color-accent);
}
.category-card__description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  margin-bottom: var(--space-md);
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none;
  font-size: var(--fs-sm);
  line-height: 1.5;
}
.category-card__detail {
  position: relative;
  width: 100%;
  min-height: 28px;
  color: var(--color-text-muted);
  font-size: var(--fs-xs);
  line-height: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}
.category-card__author {
  color: var(--color-accent);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  display: flex;
  align-items: center;
  gap: 4px;
}
.category-card__meta,
.category-card__detail {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-sm);
  font-size: var(--fs-xs);
  color: var(--color-text-muted);
}
.category-card__meta,
.category-card__tag:last-child {
  margin-top: auto;
}
.category-card__detail span,
.category-card__meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}
.category-card__date {
  color: var(--color-text-muted);
  font-size: var(--fs-xs);
}
.category-card__tag {
  margin-top: var(--space-sm);
  font-weight: var(--fw-bold);
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(56, 189, 248, 0.2);
  background: rgba(56, 189, 248, 0.05);
  border-radius: var(--border-radius-md);
  padding: 4px 10px;
  text-transform: uppercase;
  transition: var(--transition-base);
  font-size: 10px;
  letter-spacing: 1px;
}

.category-card__tag a {
  color: var(--color-primary-light);
  display: flex;
  align-items: center;
  gap: 4px;
}
.category-card__tag:hover {
  background: rgba(26, 115, 232, 0.2);
  transform: scale(1.05);
}

.category-card__tag:hover a {
  text-decoration: none;
}
.category-card__image-container {
  width: 100%;
  overflow: hidden;
  border-radius: var(--border-radius-md);
  margin-bottom: var(--space-md);
}
.category-card__image-container img {
  transition: transform var(--transition-base);
}
.category-card:hover .category-card__image-container img {
  transform: scale(1.05);
}
.category-card__ribbon {
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  overflow: hidden;
  z-index: 2;
}
.category-card__ribbon span {
  position: absolute;
  display: block;
  width: 150px;
  padding: 8px 0;
  background-color: var(--color-danger);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  color: var(--neutral-50);
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  text-transform: uppercase;
  text-align: center;
  right: -35px;
  top: 20px;
  transform: rotate(45deg);
}
</style>
<style>
.events-hero p {
  margin: 0;
  color: #aeb9c8;
  font-size: 1rem;
  line-height: 1.7;
}

.events-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 48px;
}

.events-action {
  display: grid;
  min-height: 92px;
  box-sizing: border-box;
  padding: 18px 6px;
  grid-template-columns: 42px minmax(0, 1fr) 24px;
  column-gap: 13px;
  align-items: center;
  border: 0;
  color: inherit;
  text-align: left;
  text-decoration: none;
}

.events-action:hover {
  text-decoration: none;
}

.events-action-icon {
  display: flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  color: #48a6ff;
  font-size: 27px;
}

.events-action-label {
  display: block;
  margin-bottom: 3px;
  color: #7f91a8;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  line-height: 1.2;
  text-transform: uppercase;
}

.events-action-title {
  display: block;
  font-size: 1rem;
  font-weight: 750;
  line-height: 1.35;
}

.events-action-arrow {
  display: flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  color: #48a6ff;
  font-size: 17px;
  transition: transform 0.2s ease;
}

.events-action:hover .events-action-arrow {
  transform: translateX(4px);
}

.category-card-list.events-grid {
  margin-bottom: 0;
}

.category-card__footer {
  display: flex;
  margin-top: auto;
  padding-top: 16px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 0.8rem;
}

.category-card__tag {
  min-width: 0;
  overflow: hidden;
  color: #48a6ff;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-card__link {
  flex: none;
  font-weight: 700;
}

.events-more {
  margin-top: 28px;
  text-align: center;
}

.events-more a {
  display: inline-flex;
  padding: 10px 18px;
  align-items: center;
  gap: 7px;
  border: 1px solid rgba(72, 166, 255, 0.14);
  border-radius: 10px;
  background: rgba(72, 166, 255, 0.08);
  font-weight: 700;
}

.events-more a:hover {
  text-decoration: none;
  border-color: rgba(72, 166, 255, 0.3);
  background: rgba(72, 166, 255, 0.14);
}

@media (max-width: 700px) {
  .events-actions {
    grid-template-columns: 1fr;
    gap: 6px;
    margin-bottom: 40px;
  }

  .events-action {
    min-height: 76px;
    padding: 12px 4px;
  }

  .category-card__footer {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 520px) {
  .events-action {
    grid-template-columns: 38px minmax(0, 1fr) 22px;
    column-gap: 10px;
    min-height: 68px;
  }

  .events-action-icon {
    width: 38px;
    height: 38px;
    font-size: 23px;
  }

  .events-action-label {
    font-size: 0.64rem;
  }

  .events-action-title {
    font-size: 0.94rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .events-action-arrow {
    transition: none;
  }
}
</style>
