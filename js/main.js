document.getElementById("menu").addEventListener("click", function() {
    function toggleMenu() {
        var nav = document.getElementById("tvltTopnav");
        var menu = document.getElementById("menuIcon");
        if (nav.className === "topnav_content") {
            nav.className += " hidden";
        } else {
            nav.className = "topnav_content";
        }
        if (menu.className === "fa fa-list") {
            menu.className = "bx bx-x";
        } else {
            menu.className = "fa fa-list";
        }
    }
});

window.onscroll = function() { scrollFunction() };

function scrollFunction() {
    var mybutton = document.getElementById("back-to-top");
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
}

document.getElementById("back-to-top").addEventListener("click", function() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
});