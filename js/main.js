/**
 * Main JavaScript for Thí Vua Lấy Tốt
 * Handles navigation, scroll effects, and timeline animations.
 */

/**
 * Mobile Navigation
 */
const menuBtn = document.getElementById("menu");
const dropdowns = document.querySelectorAll(".section.dropdown");
const mobileNav = document.getElementById("tvltTopnav");

const isMobileNav = () => window.matchMedia("(max-width: 1024px)").matches;

function setDropdownState(dropdown, open) {
    const trigger = dropdown.querySelector(".dropdown-trigger");
    dropdown.classList.toggle("active", open);
    if (trigger) trigger.setAttribute("aria-expanded", String(open));
}

function closeDropdowns() {
    dropdowns.forEach(dropdown => setDropdownState(dropdown, false));
}

function closeMobileNav({ restoreFocus = false } = {}) {
    if (!mobileNav || !menuBtn) return;

    mobileNav.classList.remove("active");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Mở menu điều hướng");
    document.documentElement.classList.remove("nav-open");
    document.body.classList.remove("nav-open");
    closeDropdowns();

    const menuIcon = document.getElementById("menuIcon");
    if (menuIcon) {
        menuIcon.classList.remove("bx-x");
        menuIcon.classList.add("bx-menu");
    }

    if (restoreFocus) menuBtn.focus();
}

function openMobileNav() {
    if (!mobileNav || !menuBtn) return;

    mobileNav.classList.add("active");
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.setAttribute("aria-label", "Đóng menu điều hướng");
    document.documentElement.classList.add("nav-open");
    document.body.classList.add("nav-open");

    const menuIcon = document.getElementById("menuIcon");
    if (menuIcon) {
        menuIcon.classList.remove("bx-menu");
        menuIcon.classList.add("bx-x");
    }
}

if (menuBtn) {
    menuBtn.addEventListener("click", () => {
        if (!mobileNav || !isMobileNav()) return;

        if (mobileNav.classList.contains("active")) {
            closeMobileNav();
        } else {
            openMobileNav();
        }
    });
}

dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector(".dropdown-trigger");
    if (!trigger) return;

    trigger.addEventListener("click", event => {
        if (!isMobileNav()) return;

        event.preventDefault();
        event.stopPropagation();

        const shouldOpen = !dropdown.classList.contains("active");
        dropdowns.forEach(other => {
            if (other !== dropdown) setDropdownState(other, false);
        });
        setDropdownState(dropdown, shouldOpen);
    });
});

document.addEventListener("click", event => {
    if (!isMobileNav() || !mobileNav?.classList.contains("active")) return;

    const target = event.target;
    if (mobileNav.contains(target) || menuBtn?.contains(target)) return;

    closeMobileNav();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && mobileNav?.classList.contains("active")) {
        closeMobileNav({ restoreFocus: true });
    }
});

window.addEventListener("resize", () => {
    if (!isMobileNav()) closeMobileNav();
});

if (mobileNav) {
    mobileNav.querySelectorAll("a:not(.dropdown-trigger)").forEach(link => {
        link.addEventListener("click", () => {
            if (isMobileNav()) closeMobileNav();
        });
    });
}

/**
 * Page Load Events
 */
window.addEventListener("load", function() {
    const loader = document.getElementById("loader");
    if (loader) loader.classList.remove("show");
    handleScrollEffects();
});

/**
 * Scroll Events and Performance Optimization
 */
const backToTopBtn = document.getElementById("back-to-top");
const timeline = document.querySelector('.timeline');
const timelineItems = document.querySelectorAll('[data-timeline-item]');

if (timelineItems.length) {
    if ('IntersectionObserver' in window) {
        const timelineObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.18 });

        timelineItems.forEach(item => timelineObserver.observe(item));
    } else {
        timelineItems.forEach(item => item.classList.add('is-visible'));
    }
}

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
 * Handles scroll-based UI updates
 */
function handleScrollEffects() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (backToTopBtn) backToTopBtn.style.display = scrollTop > 100 ? "flex" : "none";

    if (timeline) {
        const rect = timeline.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.top < windowHeight && rect.bottom > 0) {
            const start = rect.top;
            const end = rect.bottom;
            const current = windowHeight * 0.7;
            let scrollPercent = ((current - start) / (end - start)) * 100;
            scrollPercent = Math.min(Math.max(scrollPercent, 0), 100);
            timeline.style.setProperty('--timeline-progress', scrollPercent + '%');
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
