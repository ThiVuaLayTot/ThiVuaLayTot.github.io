function toggleMenu() {
    var nav = document.getElementById("topnav_content");
    if (nav.className === "topnav_content") {
        nav.className += " hidden";
    } else {
        nav.className = "topnav_content";
    }
}

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