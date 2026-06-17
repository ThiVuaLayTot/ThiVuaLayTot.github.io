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
 * Scroll Events
 */
const backToTopBtn = document.getElementById("back-to-top");

window.onscroll = function() {
    handleScrollEffects();
};

/**
 * Handles all scroll-based UI updates
 */
function handleScrollEffects() {
    if (backToTopBtn) {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            backToTopBtn.style.display = "flex";
        } else {
            backToTopBtn.style.display = "none";
        }
    }

    // Timeline Scroll Progress
    const timeline = document.querySelector('.timeline');
    if (timeline) {
        const rect = timeline.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.top < windowHeight && rect.bottom > 0) {
            const start = rect.top;
            const end = rect.bottom;
            const current = windowHeight * 0.7; // Target line progress to 70% of viewport

            let scrollPercent = ((current - start) / (end - start)) * 100;
            scrollPercent = Math.min(Math.max(scrollPercent, 0), 100);

            document.documentElement.style.setProperty('--timeline-progress', scrollPercent + '%');
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
