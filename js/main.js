document.getElementById("menu").addEventListener("click", function() {
    var nav = document.getElementById("tvltTopnav");
    var menu = document.getElementById("menuIcon");
    var btn = this;

    nav.classList.toggle("active");
    var isActive = nav.classList.contains("active");
    btn.setAttribute("aria-expanded", isActive);
    btn.setAttribute("aria-label", isActive ? "Đóng menu điều hướng" : "Mở menu điều hướng");

    if (menu.classList.contains("bx-menu")) {
        menu.classList.remove("bx-menu");
        menu.classList.add("bx-x");
    } else {
        menu.classList.remove("bx-x");
        menu.classList.add("bx-menu");
    }
});

window.onscroll = function() { scrollFunction() };

function scrollFunction() {
    var mybutton = document.getElementById("back-to-top");
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        mybutton.style.display = "flex";
    } else {
        mybutton.style.display = "none";
    }

    // Timeline Scroll Progress
    const timeline = document.querySelector('.timeline');
    if (timeline) {
        const rect = timeline.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.top < windowHeight && rect.bottom > 0) {
            // How much of the timeline is visible from the top
            let progress = (windowHeight - rect.top) / (rect.height + windowHeight);
            // Better logic: distance from top of timeline to center of screen
            let start = rect.top;
            let end = rect.bottom;
            let current = windowHeight * 0.7; // target line progress to 70% of viewport

            let scrollPercent = ((current - start) / (end - start)) * 100;
            scrollPercent = Math.min(Math.max(scrollPercent, 0), 100);

            document.documentElement.style.setProperty('--timeline-progress', scrollPercent + '%');
        }
    }
}

document.getElementById("back-to-top").addEventListener("click", function() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
});
