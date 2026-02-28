---
layout: event
title: Bảng tổng giải Chiến Trường Thí Quân
---

<style>:root {
            --cttq-bg-dark: #0f1419;
            --cttq-bg-card: #1a1f2e;
            --cttq-bg-hover: #1a2332;
            --cttq-border: #2d3748;
            --cttq-text-main: #e2e8f0;
            --cttq-text-sec: #94a3b8;
            --cttq-text-muted: #64748b;
            --cttq-blue: #60a5fa;
            --cttq-blue-hover: #93c5fd;
            --cttq-gold: #fbbf24;
            --cttq-red: #f87171;
        }

        .cttq-months-container {
            display: grid;
            gap: 40px;
        }

        .cttq-month-section {
            background-color: var(--cttq-bg-card);
            border-radius: 8px;
            overflow: hidden;
        }

        .cttq-month-header {
            background: linear-gradient(90deg, #1e3a8a 0%, #2563eb 50%, #1e3a8a 100%);
            padding: 20px 24px;
            color: #fff;
            font-size: 18px;
            font-weight: 700;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .cttq-month-header span:last-child {
            font-size: 12px;
            color: #cbd5e1;
        }

        /* TABLE */
        .cttq-table {
            width: 100%;
            border-collapse: collapse;
        }

        .cttq-table thead {
            background: linear-gradient(90deg, #1e3a8a 0%, #2563eb 50%, #1e3a8a 100%);
            color: #fff;
            font-weight: 600;
        }

        .cttq-table thead th {
            padding: 18px 24px;
            text-align: left;
            font-size: 14px;
            letter-spacing: 0.5px;
        }

        .cttq-col-rank {
            width: 15%;
            text-align: center;
        }

        .cttq-col-player {
            width: 65%;
        }

        .cttq-col-points {
            width: 20%;
            text-align: right;
            padding-right: 40px;
        }

        .cttq-table tbody {
            background-color: var(--cttq-bg-dark);
        }

        .cttq-table tbody tr {
            border-bottom: 1px solid var(--cttq-border);
            transition: background-color 0.3s ease;
        }

        .cttq-table tbody tr:hover {
            background-color: var(--cttq-bg-hover);
        }

        .cttq-table tbody td {
            padding: 20px 24px;
            font-size: 14px;
        }

        .cttq-rank-cell {
            text-align: center;
            font-weight: 600;
            color: var(--cttq-gold);
            font-size: 15px;
        }

        .cttq-points-cell {
            text-align: right;
            padding-right: 40px;
            font-weight: 700;
            color: var(--cttq-gold);
            font-size: 16px;
        }

        .cttq-player-row {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .cttq-avatar {
            width: 50px;
            height: 50px;
            border-radius: 6px;
            object-fit: cover;
            border: 2px solid #3b82f6;
            flex-shrink: 0;
        }

        .cttq-player-details {
            flex: 1;
            min-width: 0;
        }

        .cttq-player-name {
            margin-bottom: 6px;
        }

        .cttq-player-name a {
            color: var(--primary-sucess);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
        }

        .cttq-player-name a:hover {
            color: var(--color-light-green);
            text-decoration: underline;
        }

        .cttq-tournaments {
            font-size: 12px;
            color: var(--cttq-text-sec);
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .cttq-tournament-link {
            color: var(--cttq-blue);
            text-decoration: none;
            font-size: 11px;
            padding: 2px 6px;
            background-color: rgba(96, 165, 250, 0.1);
            border-radius: 3px;
            transition: all 0.2s;
            display: inline-block;
            white-space: nowrap;
        }

        .cttq-tournament-link:hover {
            color: var(--cttq-blue-hover);
            background-color: rgba(96, 165, 250, 0.2);
            text-decoration: underline;
        }

        /* CARD LAYOUT - MOBILE */
        .cttq-card {
            display: none;
            padding: 16px;
            background: var(--cttq-bg-hover);
            border-bottom: 1px solid var(--cttq-border);
            border-radius: 6px;
            margin-bottom: 12px;
        }

        .cttq-card.show {
            display: block;
        }

        .cttq-card-header {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 12px;
        }

        .cttq-card-rank {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--cttq-bg-dark);
            border-radius: 4px;
            font-weight: 700;
            color: var(--cttq-gold);
            flex-shrink: 0;
        }

        .cttq-card-info {
            flex: 1;
            min-width: 0;
        }

        .cttq-card-avatar {
            width: 40px;
            height: 40px;
            border-radius: 4px;
            object-fit: cover;
            border: 2px solid var(--cttq-blue);
            flex-shrink: 0;
            margin-bottom: 8px;
        }

        .cttq-card-name {
            font-weight: 600;
            color: var(--cttq-blue);
            margin-bottom: 4px;
        }

        .cttq-card-name a {
            color: var(--cttq-blue);
            text-decoration: none;
        }

        .cttq-card-name a:hover {
            color: var(--cttq-blue-hover);
        }

        .cttq-card-points {
            font-size: 13px;
            color: var(--cttq-gold);
            font-weight: 700;
        }

        .cttq-card-tournaments {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid var(--cttq-border);
        }

        .cttq-toggle-btn {
            background: none;
            border: none;
            color: var(--cttq-blue);
            cursor: pointer;
            font-size: 12px;
            padding: 0;
            font-weight: 500;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: color 0.2s;
        }

        .cttq-toggle-btn:hover {
            color: var(--cttq-blue-hover);
        }

        .cttq-tournament-list {
            display: none;
            flex-direction: column;
            gap: 6px;
        }

        .cttq-tournament-list.show {
            display: flex;
        }

        /* SKELETON */
        .cttq-skeleton {
            background: linear-gradient(90deg, #2d3748 0%, #3a4556 50%, #2d3748 100%);
            background-size: 200% 100%;
            animation: cttq-load 1.5s ease-in-out infinite;
        }

        @keyframes cttq-load {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }

        .cttq-skeleton-row {
            padding: 20px 24px;
            border-bottom: 1px solid var(--cttq-border);
        }

        .cttq-skeleton-rank {
            width: 40px;
            height: 20px;
            margin: 0 auto;
            border-radius: 3px;
        }

        .cttq-skeleton-avatar {
            width: 50px;
            height: 50px;
            border-radius: 6px;
            flex-shrink: 0;
        }

        .cttq-skeleton-name {
            width: 150px;
            height: 16px;
            margin-bottom: 8px;
            border-radius: 3px;
        }

        .cttq-skeleton-tournaments {
            width: 300px;
            height: 12px;
            border-radius: 3px;
        }

        .cttq-skeleton-points {
            width: 40px;
            height: 20px;
            border-radius: 3px;
        }

        .cttq-footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px 0;
            border-top: 1px solid var(--cttq-border);
            color: var(--cttq-text-muted);
            font-size: 12px;
        }

        /* RESPONSIVE - 768px */
        @media (max-width: 768px) {
            .cttq-container { padding: 20px 15px; }
            .cttq-title { font-size: 24px; }
            .cttq-subtitle { font-size: 13px; }

            .cttq-table { display: none; }
            .cttq-card { display: block; }

            .cttq-month-header {
                padding: 16px 20px;
                font-size: 16px;
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
            }

            .cttq-card { padding: 14px; }
            .cttq-avatar { width: 44px; height: 44px; }
            .cttq-card-name { font-size: 14px; }
            .cttq-card-points { font-size: 13px; }
            .cttq-tournament-link { font-size: 11px; padding: 4px 8px; }
        }

        /* RESPONSIVE - 600px */
        @media (max-width: 600px) {
            .cttq-container { padding: 15px 12px; }
            .cttq-title { font-size: 22px; margin-bottom: 8px; }
            .cttq-subtitle { font-size: 12px; }

            .cttq-card { padding: 12px; margin-bottom: 10px; }
            .cttq-card-rank { width: 38px; height: 38px; font-size: 12px; }
            .cttq-avatar { width: 38px; height: 38px; }
            .cttq-card-name { font-size: 13px; margin-bottom: 3px; }
            .cttq-card-points { font-size: 12px; }
            .cttq-toggle-btn { font-size: 11px; margin-bottom: 6px; }
            .cttq-tournament-link { font-size: 10px; padding: 3px 6px; word-break: break-word; }

            .cttq-month-header { padding: 14px 16px; font-size: 15px; }
            .cttq-footer { font-size: 11px; margin-top: 20px; padding: 15px 0; }
        }

        /* RESPONSIVE - 480px */
        @media (max-width: 480px) {
            .cttq-container { padding: 12px 10px; }
            .cttq-header { margin-bottom: 20px; padding: 12px 0; }
            .cttq-title { font-size: 20px; margin-bottom: 5px; }
            .cttq-subtitle { font-size: 11px; }

            .cttq-card { padding: 10px; margin-bottom: 8px; }
            .cttq-card-rank { width: 36px; height: 36px; font-size: 11px; }
            .cttq-avatar { width: 36px; height: 36px; }
            .cttq-card-name { font-size: 12px; }
            .cttq-card-points { font-size: 11px; }
            .cttq-toggle-btn { font-size: 10px; gap: 4px; margin-bottom: 4px; }
            .cttq-tournament-link { font-size: 9px; padding: 2px 5px; line-height: 1.3; }

            .cttq-card-tournaments { margin-top: 10px; padding-top: 10px; }
            .cttq-month-header { padding: 12px 14px; font-size: 14px; }
            .cttq-months-container { gap: 20px; }
            .cttq-footer { font-size: 10px; margin-top: 15px; padding: 10px 0; }
        }

        /* RESPONSIVE - 360px */
        @media (max-width: 360px) {
            .cttq-container { padding: 10px 8px; }
            .cttq-title { font-size: 18px; }
            .cttq-subtitle { font-size: 10px; }

            .cttq-card { padding: 8px; margin-bottom: 6px; }
            .cttq-card-rank { width: 32px; height: 32px; font-size: 10px; }
            .cttq-avatar { width: 32px; height: 32px; }
            .cttq-card-name { font-size: 11px; }
            .cttq-card-points { font-size: 10px; }
            .cttq-toggle-btn { font-size: 9px; }
            .cttq-tournament-link { font-size: 8px; padding: 2px 4px; }

            .cttq-month-header { padding: 10px 12px; font-size: 13px; }
}</style>
<h1 align="center">Các kỳ thủ đạt giải <a href="/events/cttq-chien-truong-thi-quan" style="color: lightskyblue">Chiến Trường Thí Quân</a></h1>
<ul class="tab">
    <li><a href="tvlt">Thí Vua Lấy Tốt</a></li>
    <li><a href="cbtt">Cờ Bí Thí Tốt</a></li>
    <li><a href="cttq" class="active">Chiến Trường Thí Quân</a></li>
    <li><a href="dttv">Đấu Trường Thí Vua</a></li>
</ul><br>
<p>Giải được quản lý bởi Admin <a href="/leaders#admin3">M-DinhHoangViet</a>. <a href="/events/cttq-chien-truong-thi-quan">Chi tiết về sự kiện này.</a></p>
<div class="cttq-months-container" id="cttq-months-container"></div>
<a href="/events/cttq-chien-truong-thi-quan"><img alt="Chiến Trường Thí Quân logo" src="/images/events/cttq_logo.png"></a>
<i>Nếu có vấn đề thì xin hãy liên hệ <a href="/leaders#admins" target="_top">quản trị viên</a>.</i>
<br>
<script src="/js/cttq-fetcher.js"></script>
