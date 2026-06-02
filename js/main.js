document.getElementById("menu").addEventListener("click", function() {
    var nav = document.getElementById("tvltTopnav");
    var menu = document.getElementById("menuIcon");
    var btn = this;

    nav.classList.toggle("active");
    var isActive = nav.classList.contains("active");
    btn.setAttribute("aria-expanded", isActive);
    btn.setAttribute("aria-label", isActive ? "Đóng menu điều hướng" : "Mở menu điều hướng");

    if (menu.classList.contains("fa-list")) {
        menu.classList.remove("fa", "fa-list");
        menu.classList.add("bx", "bx-x");
    } else {
        menu.classList.remove("bx", "bx-x");
        menu.classList.add("fa", "fa-list");
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
}

document.getElementById("back-to-top").addEventListener("click", function() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
});
