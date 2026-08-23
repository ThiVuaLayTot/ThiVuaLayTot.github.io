/**
 * Main JavaScript for Thí Vua Lấy Tốt
 * Handles navigation, scroll effects, and timeline animations.
 */

/**
 * Mobile Navigation Toggle and Dropdowns
 */
const menuBtn = document.getElementById("menu");
const dropdowns = document.querySelectorAll(".section.dropdown");
const mobileNav = document.getElementById("tvltTopnav");

function syncMobileNavLayout() {
    if (!mobileNav) return;

    if (window.innerWidth <= 1024 && mobileNav.classList.contains("active")) {
        mobileNav.style.left = "auto";
        mobileNav.style.right = "0";
        mobileNav.style.width = "min(360px, calc(100vw - 20px))";
        mobileNav.style.marginTop = "8px";
        mobileNav.style.paddingLeft = "10px";
        mobileNav.style.paddingRight = "10px";
        mobileNav.style.border = "1px solid rgba(148, 163, 184, 0.14)";
        mobileNav.style.borderRadius = "14px";
        mobileNav.style.boxShadow = "0 18px 42px rgba(0, 0, 0, 0.38)";
    } else {
        mobileNav.style.removeProperty("left");
        mobileNav.style.removeProperty("right");
        mobileNav.style.removeProperty("width");
        mobileNav.style.removeProperty("margin-top");
        mobileNav.style.removeProperty("padding-left");
        mobileNav.style.removeProperty("padding-right");
        mobileNav.style.removeProperty("border");
        mobileNav.style.removeProperty("border-radius");
        mobileNav.style.removeProperty("box-shadow");
    }
}

function closeMobileNav() {
    if (!mobileNav || !menuBtn) return;

    mobileNav.classList.remove("active");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Mở menu điều hướng");

    const menuIcon = document.getElementById("menuIcon");
    if (menuIcon) {
        menuIcon.classList.remove("bx-x");
        menuIcon.classList.add("bx-menu");
    }

    dropdowns.forEach(dropdown => {
        dropdown.classList.remove("active");
        const trigger = dropdown.querySelector(".dropdown-trigger");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
    });

    syncMobileNavLayout();
}

if (menuBtn) {
    menuBtn.addEventListener("click", function() {
        if (!mobileNav) return;

        mobileNav.classList.toggle("active");
        const isActive = mobileNav.classList.contains("active");

        this.setAttribute("aria-expanded", isActive);
        this.setAttribute("aria-label", isActive ? "Đóng menu điều hướng" : "Mở menu điều hướng");

        const menuIcon = document.getElementById("menuIcon");
        if (menuIcon) {
            menuIcon.classList.toggle("bx-menu", !isActive);
            menuIcon.classList.toggle("bx-x", isActive);
        }

        if (!isActive) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove("active");
                const trigger = dropdown.querySelector(".dropdown-trigger");
                if (trigger) trigger.setAttribute("aria-expanded", "false");
            });
        }

        syncMobileNavLayout();
    });
}

dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector(".dropdown-trigger");
    if (trigger) {
        trigger.addEventListener("click", function(e) {
            if (window.innerWidth <= 1024) {
                e.preventDefault();
                e.stopPropagation();

                const isActive = dropdown.classList.contains("active");

                dropdowns.forEach(other => {
                    if (other !== dropdown) {
                        other.classList.remove("active");
                        const otherTrigger = other.querySelector(".dropdown-trigger");
                        if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
                    }
                });

                dropdown.classList.toggle("active", !isActive);
                this.setAttribute("aria-expanded", String(!isActive));
            }
        });
    }
});

window.addEventListener("resize", syncMobileNavLayout, { passive: true });

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && mobileNav?.classList.contains("active")) {
        closeMobileNav();
        menuBtn?.focus();
    }
});

/**
 * Page Load Events
 */
window.addEventListener("load", function() {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.classList.remove("show");
    }

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

    if (backToTopBtn) {
        backToTopBtn.style.display = scrollTop > 100 ? "flex" : "none";
    }

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
