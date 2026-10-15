/**
 * Main site navigation
 */
const menuBtn = document.getElementById("menu");
const mobileNav = document.getElementById("tvltTopnav");
const dropdowns = document.querySelectorAll(".section.dropdown");
const isMobileNav = () => window.matchMedia("(max-width: 1024px)").matches;
let dropdownCloseTimer = null;

function cancelDropdownClose() {
    if (dropdownCloseTimer !== null) {
        window.clearTimeout(dropdownCloseTimer);
        dropdownCloseTimer = null;
    }
}

function setDropdownState(dropdown, open) {
    const trigger = dropdown.querySelector(".dropdown-trigger");
    dropdown.classList.toggle("active", open);
    if (trigger) trigger.setAttribute("aria-expanded", String(open));
    if (open) delete dropdown.dataset.escapeClosed;
}

function closeDropdowns() {
    cancelDropdownClose();
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
        event.preventDefault();

        const shouldOpen = !dropdown.classList.contains("active");

        closeDropdowns();
        setDropdownState(dropdown, shouldOpen);

        if (!shouldOpen && !isMobileNav()) {
            dropdown.dataset.escapeClosed = "true";
            trigger.blur();
        }
    });

    dropdown.addEventListener("pointerenter", () => {
        if (isMobileNav()) return;

        closeDropdowns();
        if (dropdown.dataset.escapeClosed !== "true") {
            setDropdownState(dropdown, true);
        }
    });

    dropdown.addEventListener("pointerleave", () => {
        if (isMobileNav()) return;

        cancelDropdownClose();
        dropdownCloseTimer = window.setTimeout(() => {
            dropdownCloseTimer = null;

            if (!dropdown.matches(":hover") && !dropdown.contains(document.activeElement)) {
                delete dropdown.dataset.escapeClosed;
                setDropdownState(dropdown, false);
            }
        }, 160);
    });

    dropdown.addEventListener("focusin", () => {
        if (isMobileNav()) return;

        closeDropdowns();
        if (dropdown.dataset.escapeClosed !== "true") {
            setDropdownState(dropdown, true);
        }
    });

    dropdown.addEventListener("focusout", event => {
        if (isMobileNav() || dropdown.contains(event.relatedTarget)) return;

        cancelDropdownClose();
        dropdownCloseTimer = window.setTimeout(() => {
            dropdownCloseTimer = null;

            if (!dropdown.contains(document.activeElement) && !dropdown.matches(":hover")) {
                delete dropdown.dataset.escapeClosed;
                setDropdownState(dropdown, false);
            }
        }, 100);
    });
});

document.addEventListener("click", event => {
    if (isMobileNav() && mobileNav?.classList.contains("active")) {
        if (mobileNav.contains(event.target) || menuBtn?.contains(event.target)) return;
        closeMobileNav();
        return;
    }

    if (!Array.from(dropdowns).some(dropdown => dropdown.contains(event.target))) {
        closeDropdowns();
    }
});

document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    const openDropdown = Array.from(dropdowns)
        .find(dropdown => dropdown.classList.contains("active"));

    if (openDropdown) {
        const trigger = openDropdown.querySelector(".dropdown-trigger");
        setDropdownState(openDropdown, false);
        openDropdown.dataset.escapeClosed = "true";
        trigger?.focus();
        return;
    }

    if (mobileNav?.classList.contains("active")) {
        closeMobileNav({ restoreFocus: true });
    }
});

window.addEventListener("resize", () => {
    closeDropdowns();
    if (!isMobileNav()) closeMobileNav();
});

if (mobileNav) {
    mobileNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            if (isMobileNav()) closeMobileNav();
        });
    });
}

function normalizePath(path) {
    const normalized = path.replace(/\/+$/, "");
    return normalized || "/";
}

function markCurrentRoute() {
    if (!mobileNav) return;

    const currentPath = normalizePath(window.location.pathname.toLowerCase());
    const currentHash = window.location.hash;
    const links = Array.from(
        document.querySelectorAll(".page-header .nav-link, .page-header .dropdown-menu a")
    );

    links.forEach(link => {
        link.classList.remove("nav-link--active");
        link.removeAttribute("aria-current");
    });
    dropdowns.forEach(dropdown => dropdown.classList.remove("has-current"));

    const candidates = links.filter(link => {
        const url = new URL(link.href, window.location.origin);
        if (url.origin !== window.location.origin) return false;

        const linkPath = normalizePath(url.pathname.toLowerCase());
        if (url.hash && url.hash !== currentHash) return false;
        if (linkPath === "/" && currentPath !== "/") return false;

        return currentPath === linkPath ||
            (linkPath !== "/" && currentPath.startsWith(linkPath + "/"));
    });

    candidates.sort((a, b) => {
        const urlA = new URL(a.href, window.location.origin);
        const urlB = new URL(b.href, window.location.origin);
        const scoreA = normalizePath(urlA.pathname).length +
            (urlA.hash && urlA.hash === currentHash ? 10000 : 0);
        const scoreB = normalizePath(urlB.pathname).length +
            (urlB.hash && urlB.hash === currentHash ? 10000 : 0);
        return scoreB - scoreA;
    });

    const activeLink = candidates[0];
    if (!activeLink) return;

    activeLink.classList.add("nav-link--active");
    activeLink.setAttribute("aria-current", "page");
    activeLink.closest(".section.dropdown")?.classList.add("has-current");
}

markCurrentRoute();


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
