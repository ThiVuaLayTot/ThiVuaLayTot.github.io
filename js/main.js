function toggleMenu() {
    const nav = document.getElementById("tvlttopnav");
    if (nav.className === "topnav") {
        nav.className += " responsive";
    } else {
        nav.className = "topnav";
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