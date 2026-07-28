/**
 * Main JavaScript for Thí Vua Lấy Tốt
 * Handles navigation, scroll effects, and timeline animations.
 */

/**
 * Mobile Navigation Toggle and Dropdowns
 */
const menuBtn = document.getElementById("menu");
const dropdowns = document.querySelectorAll(".section.dropdown");

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

        // Close all dropdowns when the mobile navigation bar is closed
        if (!isActive) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove("active");
                const trigger = dropdown.querySelector(".dropdown-trigger");
                if (trigger) {
                    trigger.setAttribute("aria-expanded", "false");
                }
            });
        }
    });
}

// Mobile Dropdown toggles click handler
dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector(".dropdown-trigger");
    if (trigger) {
        trigger.addEventListener("click", function(e) {
            if (window.innerWidth <= 1024) {
                e.preventDefault();
                e.stopPropagation();

                const isActive = dropdown.classList.contains("active");

                // Collapse all other dropdowns
                dropdowns.forEach(other => {
                    if (other !== dropdown) {
                        other.classList.remove("active");
                        const otherTrigger = other.querySelector(".dropdown-trigger");
                        if (otherTrigger) {
                            otherTrigger.setAttribute("aria-expanded", "false");
                        }
                    }
                });

                // Toggle current dropdown
                if (isActive) {
                    dropdown.classList.remove("active");
                    this.setAttribute("aria-expanded", "false");
                } else {
                    dropdown.classList.add("active");
                    this.setAttribute("aria-expanded", "true");
                }
            }
        });
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
