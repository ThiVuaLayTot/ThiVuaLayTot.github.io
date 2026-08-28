---
layout: default
title: Liên hệ và Đóng góp
decription: Chọn đúng hình thức liên hệ cho nhu cầu của bạn. Từ góp ý về câu lạc bộ đến liên hệ với các quản trị viên, mọi phản hồi đều giúp Thí Vua Lấy Tốt tốt hơn.
---

<section class="contact-methods">
    <article class="contact-method">
        <div class="method-icon"><span class="bx bx-user-voice"></span></div>
        <div class="method-content">
            <span class="method-label">Liên hệ trực tiếp</span>
            <h2>Ban điều hành</h2>
            <p>Cần trao đổi trực tiếp với quản trị viên? Xem danh sách Ban điều hành và vai trò của từng thành viên.</p>
            <a class="method-link" href="/leaders">Xem Ban điều hành <span class="bx bx-right-arrow-alt"></span></a>
        </div>
    </article>
    <article class="contact-method contact-method--primary">
        <div class="method-icon"><span class="bx bx-edit-alt"></span></div>
        <div class="method-content">
            <span class="method-label">Gửi đánh giá và góp ý</span>
            <h2>Góp ý &amp; phản hồi</h2>
            <p>Gửi đánh giá, đề xuất hoặc báo cáo vấn đề để Ban điều hành có thể tiếp nhận và xem xét cải thiện.</p>
            <a class="method-link" href="https://forms.gle/iCYUAbVD5GUmbdsL8" target="_blank"
                rel="noopener noreferrer">Mở form phản hồi <span class="bx bx-right-arrow-alt"></span></a>
        </div>
    </article>
</section>
<section class="contact-donation">
    <div class="donation-copy">
        <div class="donation-icon"><span class="bx bx-heart"></span></div>
        <div>
            <span class="section-label">Đồng hành cùng Mr.TungJohn</span>
            <h2>Ủng hộ hoạt động của TungJohn</h2>
            <p>Khoản ủng hộ giúp duy trì các giải đấu và những hoạt động của <a href="/leaders#own">Mr.TungJohn</a>.</p>
        </div>
    </div>
    <a class="donation-qr" href="/images/tvlt/payment.jpg" target="_blank" rel="noopener noreferrer">
        <span class="qr-frame"><img src="/images/tvlt/payment.jpg" alt="Mã QR ủng hộ Mr.TungJohn" loading="lazy"></span>
        <span class="qr-copy"><strong>Quét mã QR để ủng hộ</strong><span>Sử dụng ứng dụng ngân hàng để thực hiện thanh
                toán.</span></span>
    </a>
</section>

<style>
.contact-page {
    --accent: var(--color-accent, #35c9fc);
    --purple: #9b7cff;
    --text: var(--color-text-primary, #f8fafc);
    --muted: var(--color-text-secondary, #aeb9c8);
    max-width: 1080px;
    margin: auto;
    padding: 1rem 1rem 2.5rem;
}

.contact-hero {
    position: relative;
    max-width: 760px;
    margin: 0 auto 2.75rem;
    text-align: center;
}

.contact-hero::before {
    content: "";
    position: absolute;
    z-index: -1;
    top: -80px;
    left: 50%;
    width: 360px;
    height: 260px;
    transform: translateX(-50%);
    border-radius: 50%;
    background: radial-gradient(circle, rgba(53,201,252,.13), transparent 68%);
    filter: blur(18px);
}

.contact-hero h1 {
    margin: 0;
    color: var(--text);
    font-size: clamp(2.1rem, 5vw, 3.45rem);
    line-height: 1.08;
    letter-spacing: -.04em;
}

.contact-hero h1 span {
    background: linear-gradient(110deg, var(--accent), var(--purple));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.contact-hero p {
    max-width: 680px;
    margin: 1rem auto 0;
    color: var(--muted);
    font-size: .95rem;
    line-height: 1.7;
}

.contact-methods {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}

.contact-method,
.contact-donation {
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 1.15rem;
    background: rgba(12,19,32,.52);
    box-shadow: 0 16px 40px rgba(0,0,0,.16);
}

.contact-method {
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0,1fr);
    gap: 1rem;
    min-height: 215px;
    padding: 1.5rem;
    overflow: hidden;
    transition: transform .22s ease, border-color .22s ease, background .22s ease;
}

.contact-method::after {
    content: "";
    position: absolute;
    right: -90px;
    bottom: -100px;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background: rgba(53,201,252,.07);
    filter: blur(22px);
    pointer-events: none;
}

.contact-method--primary {
    border-color: rgba(53,201,252,.24);
    background: linear-gradient(135deg, rgba(53,201,252,.08), rgba(12,19,32,.65) 52%);
}

.contact-method--primary::after { background: rgba(155,124,255,.1); }

.contact-method:hover,
.contact-method:focus-within {
    transform: translateY(-3px);
    border-color: rgba(53,201,252,.35);
    background: rgba(17,27,44,.78);
}

.method-icon,
.donation-icon {
    display: grid;
    place-items: center;
    border-radius: .85rem;
    background: rgba(53,201,252,.09);
    color: var(--accent);
}

.method-icon {
    width: 46px;
    height: 46px;
    border: 1px solid rgba(53,201,252,.18);
    font-size: 1.35rem;
}

.contact-method--primary .method-icon {
    border-color: rgba(155,124,255,.2);
    background: rgba(155,124,255,.09);
    color: #b7a3ff;
}

.method-content { position: relative; z-index: 1; }
.method-label,
.section-label {
    display: block;
    color: #8290a3;
    font-size: .67rem;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
}

.method-content h2,
.donation-copy h2 {
    margin: .3rem 0 .45rem;
    color: var(--text);
    font-size: 1.25rem;
}

.method-content p,
.donation-copy p {
    margin: 0;
    color: var(--muted);
    font-size: .82rem;
    line-height: 1.6;
}

.method-link {
    display: inline-flex;
    align-items: center;
    gap: .35rem;
    margin-top: 1rem;
    color: var(--accent);
    font-size: .78rem;
    font-weight: 700;
    text-decoration: none;
}

.method-link:hover { color: #fff; }

.contact-donation {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    margin-top: 1rem;
    padding: 1.5rem;
    background: linear-gradient(100deg, rgba(155,124,255,.06), rgba(12,19,32,.48));
}

.donation-copy {
    display: flex;
    align-items: flex-start;
    gap: .9rem;
    max-width: 570px;
}

.donation-icon {
    flex: 0 0 42px;
    width: 42px;
    height: 42px;
    background: rgba(155,124,255,.1);
    color: #b7a3ff;
    font-size: 1.2rem;
}

.donation-qr {
    display: flex;
    align-items: center;
    gap: .85rem;
    flex: 0 0 auto;
    padding: .65rem;
    border: 1px solid rgba(255,255,255,.07);
    border-radius: .9rem;
    background: rgba(255,255,255,.025);
    text-decoration: none;
}

.qr-frame {
    display: block;
    width: 86px;
    height: 86px;
    padding: .3rem;
    border-radius: .55rem;
    background: #fff;
}

.qr-frame img {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: .3rem;
    object-fit: cover;
}

.qr-copy {
    display: flex;
    max-width: 155px;
    flex-direction: column;
    gap: .25rem;
}

.qr-copy strong { color: var(--text); font-size: .76rem; }
.qr-copy span { color: #7f8da0; font-size: .67rem; line-height: 1.45; }

.contact-page a:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
}

@media (max-width: 820px) {
    .contact-methods { grid-template-columns: 1fr; }
}

@media (max-width: 620px) {
    .contact-page { padding: .5rem .75rem 2rem; }
    .contact-hero { margin-bottom: 1.75rem; }
    .contact-hero h1 { font-size: clamp(1.9rem, 9vw, 2.5rem); }
    .contact-hero p { font-size: .86rem; }
    .contact-method,
    .contact-donation { padding: 1rem; border-radius: 1rem; }
    .contact-method { min-height: 0; }
    .contact-donation { flex-direction: column; align-items: stretch; }
    .donation-copy { max-width: none; }
    .donation-qr { width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
    .contact-method { transition: none; }
}
</style>
