/**
 * Main JavaScript for Thí Vua Lấy Tốt
 * Handles navigation, scroll effects, and timeline animations.
 */

/**
 * Mobile Navigation Toggle
 */
const menuBtn = document.getElementById("menu");
if (menuBtn) {
    menuBtn.addEventListener("click", function() {
        const nav = document.getElementById("tvltTopnav");
        const menuIcon = document.getElementById("menuIcon");

        nav.classList.toggle("active");
        const isActive = nav.classList.contains("active");

        this.setAttribute("aria-expanded", isActive);
        this.setAttribute("aria-label", isActive ? "Đóng menu điều hướng" : "Mở menu điều hướng");

        if (menuIcon) {
            if (menuIcon.classList.contains("bx-menu")) {
                menuIcon.classList.remove("bx-menu");
                menuIcon.classList.add("bx-x");
            } else {
                menuIcon.classList.remove("bx-x");
                menuIcon.classList.add("bx-menu");
            }
        }
    });
}

/**
 * Page Load Events
 */
window.addEventListener("load", function() {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.classList.remove("show");
    }
});

/**
 * Scroll Events and Performance Optimization
 */
const backToTopBtn = document.getElementById("back-to-top");
const timeline = document.querySelector('.timeline');
const rootStyle = document.documentElement.style;

let isScrolling = false;

window.addEventListener("scroll", () => {
    if (!isScrolling) {
        window.requestAnimationFrame(() => {
            handleScrollEffects();
            isScrolling = false;
        });
        isScrolling = true;
    }
}, { passive: true });

/**
 * Handles all scroll-based UI updates
 */
function handleScrollEffects() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (backToTopBtn) {
        backToTopBtn.style.display = scrollTop > 100 ? "flex" : "none";
    }

    // Timeline Scroll Progress
    if (timeline) {
        const rect = timeline.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.top < windowHeight && rect.bottom > 0) {
            const start = rect.top;
            const end = rect.bottom;
            const current = windowHeight * 0.7; // Target line progress to 70% of viewport

            let scrollPercent = ((current - start) / (end - start)) * 100;
            scrollPercent = Math.min(Math.max(scrollPercent, 0), 100);

            rootStyle.setProperty('--timeline-progress', scrollPercent + '%');
        }
    }
}

/**
 * Back to Top Button
 */
if (backToTopBtn) {
    backToTopBtn.addEventListener("click", function() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });
}

/* ============================================================
   BẢNG GIẢI ĐẤU: cuộn ngang bằng chuột lăn, chỉ báo cuộn
   ============================================================ */
(function () {
    const isScrollableTable = (table) => table && table.scrollWidth > table.clientWidth;

    // Bật/tắt class báo hiệu còn nội dung để cuộn, dùng để hiện bóng mờ 2 bên
    function updateScrollIndicators(table) {
        if (!table) return;
        const maxScroll = table.scrollWidth - table.clientWidth;
        table.classList.toggle("can-scroll-left", table.scrollLeft > 4);
        table.classList.toggle("can-scroll-right", table.scrollLeft < maxScroll - 4);
    }

    function initTable(table) {
        if (!table || table.dataset.scrollEnhanced) return;
        table.dataset.scrollEnhanced = "true";
        updateScrollIndicators(table);
        table.addEventListener("scroll", () => updateScrollIndicators(table), { passive: true });
        window.addEventListener("resize", () => updateScrollIndicators(table));
    }

    // Bắt các bảng được chèn động sau khi tournament-fetcher.js tải xong dữ liệu
    const observer = new MutationObserver(() => {
        document.querySelectorAll(".table").forEach(initTable);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.querySelectorAll(".table").forEach(initTable);

    // Lăn chuột dọc -> cuộn ngang (cho PC không có touchpad)
    document.addEventListener("wheel", function (e) {
        const table = e.target.closest(".table");
        if (!table || !isScrollableTable(table)) return;
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        e.preventDefault();
        table.scrollLeft += e.deltaY;
    }, { passive: false });
})();
