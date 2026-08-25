---
layout: default
title: Liên hệ - Thí Vua Lấy Tốt
permalink: /contact
---

<div class="contact-page">
    <section class="contact-hero wow fadeInUp" data-wow-delay="0.05s">
        <div class="contact-hero-badge">
            <span class="bx bxs-message-rounded-dots"></span>
            <span>Liên hệ Thí Vua Lấy Tốt</span>
        </div>
        <h1>Chúng tôi luôn <span>sẵn sàng lắng nghe.</span></h1>
        <p>Chọn đúng hình thức liên hệ cho nhu cầu của bạn. Từ góp ý về câu lạc bộ đến hỗ trợ website, mọi phản hồi đều giúp TVLT tốt hơn.</p>
    </section>

    <section class="contact-methods" aria-label="Các hình thức liên hệ">
        <a class="contact-method contact-method--primary wow fadeInUp" data-wow-delay="0.1s" href="https://forms.gle/iCYUAbVD5GUmbdsL8" target="_blank" rel="noopener noreferrer">
            <div class="method-icon"><span class="bx bx-edit-alt"></span></div>
            <div class="method-content">
                <span class="method-label">Khuyến nghị</span>
                <h2>Góp ý &amp; phản hồi</h2>
                <p>Gửi đánh giá, đề xuất hoặc báo cáo vấn đề để Ban điều hành có thể tiếp nhận và xử lý.</p>
                <span class="method-link">Mở form phản hồi <span class="bx bx-right-arrow-alt"></span></span>
            </div>
        </a>

        <a class="contact-method wow fadeInUp" data-wow-delay="0.15s" href="/leaders">
            <div class="method-icon"><span class="bx bx-user-voice"></span></div>
            <div class="method-content">
                <span class="method-label">Liên hệ trực tiếp</span>
                <h2>Ban điều hành</h2>
                <p>Cần trao đổi trực tiếp với người phụ trách? Xem danh sách Ban điều hành và vai trò của từng thành viên.</p>
                <span class="method-link">Xem Ban điều hành <span class="bx bx-right-arrow-alt"></span></span>
            </div>
        </a>
    </section>

    <section class="contact-support wow fadeInUp" data-wow-delay="0.2s">
        <div class="support-copy">
            <span class="section-label">Bạn đang cần hỗ trợ?</span>
            <h2>Chúng tôi có thể giúp gì cho bạn?</h2>
            <p>Không chắc nên liên hệ ở đâu? Hãy dùng form phản hồi cho các vấn đề chung. Nếu vấn đề liên quan đến website hoặc kỹ thuật, bạn có thể xem thông tin người phụ trách trên trang Ban điều hành.</p>
        </div>

        <div class="support-points">
            <div class="support-point">
                <span class="bx bx-check-circle"></span>
                <div>
                    <strong>Ý tưởng &amp; góp ý</strong>
                    <span>Đề xuất tính năng, giải đấu hoặc hoạt động mới.</span>
                </div>
            </div>
            <div class="support-point">
                <span class="bx bx-check-circle"></span>
                <div>
                    <strong>Báo lỗi website</strong>
                    <span>Mô tả lỗi và cung cấp thông tin cần thiết để kiểm tra.</span>
                </div>
            </div>
            <div class="support-point">
                <span class="bx bx-check-circle"></span>
                <div>
                    <strong>Hợp tác &amp; đồng hành</strong>
                    <span>Trao đổi với Ban điều hành về các hoạt động của CLB.</span>
                </div>
            </div>
        </div>
    </section>

    <section class="contact-donation wow fadeInUp" data-wow-delay="0.25s">
        <div class="donation-copy">
            <div class="donation-icon"><span class="bx bx-heart"></span></div>
            <div>
                <span class="section-label">Đồng hành cùng TVLT</span>
                <h2>Ủng hộ hoạt động của câu lạc bộ</h2>
                <p>Khoản ủng hộ giúp duy trì các giải đấu và những hoạt động cộng đồng của Thí Vua Lấy Tốt.</p>
            </div>
        </div>

        <div class="donation-qr">
            <div class="qr-frame">
                <img src="/images/tvlt/payment.jpg" alt="Mã QR ủng hộ Mr.TungJohn" loading="lazy">
            </div>
            <div class="qr-copy">
                <strong>Quét mã QR để ủng hộ</strong>
                <span>Sử dụng ứng dụng ngân hàng để thực hiện thanh toán.</span>
            </div>
        </div>
    </section>
</div>

<style>
.contact-page {
    --contact-accent: var(--color-accent, #35c9fc);
    --contact-purple: #9b7cff;
    --contact-text: var(--color-text-primary, #f8fafc);
    --contact-muted: var(--color-text-secondary, #aeb9c8);
    --contact-border: rgba(255, 255, 255, 0.08);
    max-width: 1080px;
    margin: 0 auto;
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
    background: radial-gradient(circle, rgba(53, 201, 252, 0.13), transparent 68%);
    filter: blur(18px);
    pointer-events: none;
}

.contact-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    margin-bottom: 1rem;
    padding: 0.42rem 0.78rem;
    border: 1px solid rgba(53, 201, 252, 0.2);
    border-radius: 999px;
    background: rgba(53, 201, 252, 0.06);
    color: var(--contact-accent);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.contact-hero h1 {
    margin: 0;
    color: var(--contact-text);
    font-size: clamp(2.1rem, 5vw, 3.45rem);
    line-height: 1.08;
    letter-spacing: -0.04em;
}

.contact-hero h1 span {
    background: linear-gradient(110deg, var(--contact-accent), var(--contact-purple));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.contact-hero p {
    max-width: 680px;
    margin: 1rem auto 0;
    color: var(--contact-muted);
    font-size: 0.95rem;
    line-height: 1.7;
}

.contact-methods {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}

.contact-method {
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 1rem;
    min-height: 215px;
    padding: 1.5rem;
    overflow: hidden;
    border: 1px solid var(--contact-border);
    border-radius: 1.15rem;
    background: rgba(12, 19, 32, 0.58);
    color: inherit;
    text-decoration: none;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.16);
    transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease;
}

.contact-method::after {
    content: "";
    position: absolute;
    right: -90px;
    bottom: -100px;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background: rgba(53, 201, 252, 0.07);
    filter: blur(22px);
    pointer-events: none;
}

.contact-method--primary {
    border-color: rgba(53, 201, 252, 0.24);
    background: linear-gradient(135deg, rgba(53, 201, 252, 0.08), rgba(12, 19, 32, 0.65) 52%);
}

.contact-method--primary::after {
    background: rgba(155, 124, 255, 0.1);
}

.contact-method:hover,
.contact-method:focus-visible {
    transform: translateY(-3px);
    border-color: rgba(53, 201, 252, 0.35);
    background: rgba(17, 27, 44, 0.78);
}

.method-icon {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    border: 1px solid rgba(53, 201, 252, 0.18);
    border-radius: 0.85rem;
    background: rgba(53, 201, 252, 0.09);
    color: var(--contact-accent);
    font-size: 1.35rem;
}

.contact-method:nth-child(2) .method-icon {
    border-color: rgba(155, 124, 255, 0.2);
    background: rgba(155, 124, 255, 0.09);
    color: #b7a3ff;
}

.method-content {
    position: relative;
    z-index: 1;
}

.method-label,
.section-label {
    display: block;
    color: #8290a3;
    font-size: 0.67rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
}

.method-content h2 {
    margin: 0.3rem 0 0.45rem;
    color: var(--contact-text);
    font-size: 1.25rem;
}

.method-content p {
    margin: 0;
    color: var(--contact-muted);
    font-size: 0.82rem;
    line-height: 1.6;
}

.method-link {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin-top: 1rem;
    color: var(--contact-accent);
    font-size: 0.78rem;
    font-weight: 700;
}

.contact-method:hover .method-link,
.contact-method:focus-visible .method-link {
    color: #fff;
}

.contact-support,
.contact-donation {
    margin-top: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--contact-border);
    border-radius: 1.15rem;
    background: rgba(12, 19, 32, 0.48);
}

.contact-support {
    display: grid;
    grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
    gap: 2rem;
    align-items: center;
}

.support-copy h2,
.donation-copy h2 {
    margin: 0.35rem 0 0.5rem;
    color: var(--contact-text);
    font-size: 1.2rem;
}

.support-copy p,
.donation-copy p {
    margin: 0;
    color: var(--contact-muted);
    font-size: 0.82rem;
    line-height: 1.65;
}

.support-points {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.7rem;
}

.support-point {
    display: flex;
    gap: 0.55rem;
    padding: 0.8rem;
    border-radius: 0.8rem;
    background: rgba(255, 255, 255, 0.025);
}

.support-point > span {
    flex: 0 0 auto;
    color: var(--contact-accent);
    font-size: 1rem;
}

.support-point div {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.support-point strong {
    color: var(--contact-text);
    font-size: 0.74rem;
}

.support-point span:not(.bx) {
    color: #7f8da0;
    font-size: 0.68rem;
    line-height: 1.45;
}

.contact-donation {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    background: linear-gradient(100deg, rgba(155, 124, 255, 0.06), rgba(12, 19, 32, 0.48));
}

.donation-copy {
    display: flex;
    align-items: flex-start;
    gap: 0.9rem;
    max-width: 570px;
}

.donation-icon {
    display: grid;
    place-items: center;
    flex: 0 0 42px;
    width: 42px;
    height: 42px;
    border-radius: 0.8rem;
    background: rgba(155, 124, 255, 0.1);
    color: #b7a3ff;
    font-size: 1.2rem;
}

.donation-qr {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    flex: 0 0 auto;
    padding: 0.65rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 0.9rem;
    background: rgba(255, 255, 255, 0.025);
}

.qr-frame {
    width: 86px;
    height: 86px;
    padding: 0.3rem;
    border-radius: 0.55rem;
    background: #fff;
}

.qr-frame img {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 0.3rem;
    object-fit: cover;
}

.qr-copy {
    display: flex;
    max-width: 155px;
    flex-direction: column;
    gap: 0.25rem;
}

.qr-copy strong {
    color: var(--contact-text);
    font-size: 0.76rem;
}

.qr-copy span {
    color: #7f8da0;
    font-size: 0.67rem;
    line-height: 1.45;
}

.contact-page a:focus-visible {
    outline: 2px solid var(--contact-accent);
    outline-offset: 3px;
}

@media (max-width: 820px) {
    .contact-methods,
    .contact-support {
        grid-template-columns: 1fr;
    }

    .support-points {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (max-width: 620px) {
    .contact-page {
        padding: 0.5rem 0.75rem 2rem;
    }

    .contact-hero {
        margin-bottom: 1.75rem;
    }

    .contact-hero h1 {
        font-size: clamp(1.9rem, 9vw, 2.5rem);
    }

    .contact-hero p {
        font-size: 0.86rem;
    }

    .contact-method,
    .contact-support,
    .contact-donation {
        padding: 1rem;
        border-radius: 1rem;
    }

    .contact-method {
        min-height: 0;
    }

    .support-points {
        grid-template-columns: 1fr;
    }

    .contact-donation {
        flex-direction: column;
        align-items: stretch;
    }

    .donation-copy {
        max-width: none;
    }

    .donation-qr {
        width: 100%;
    }
}

@media (prefers-reduced-motion: reduce) {
    .contact-method {
        transition: none;
    }
}
</style>
