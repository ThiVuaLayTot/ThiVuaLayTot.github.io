const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;
const moonIcon = document.getElementById('moon');
const isDarkMode = localStorage.getItem('darkMode') === 'enabled';

function setDarkMode(isEnabled) {
    if (isEnabled) {
        body.classList.add('dark-mode');
        moonIcon.classList.remove('bx', 'bxs-moon');
        moonIcon.classList.add('bx', 'bxs-sun');
    } else {
        body.classList.remove('dark-mode');
        moonIcon.classList.remove('bx', 'bxs-sun');
        moonIcon.classList.add('bx', 'bxs-moon');
    }
}

function toggleDarkMode() {
    const isEnabled = darkModeToggle.checked;
    localStorage.setItem('darkMode', isEnabled ? 'enabled' : 'disabled');
    setDarkMode(isEnabled);
}

// Khởi tạo trạng thái ban đầu
setDarkMode(isDarkMode);
darkModeToggle.checked = isDarkMode;

// Xử lý sự kiện thay đổi chế độ tối
darkModeToggle.addEventListener('change', toggleDarkMode);

// Get the button
let mybutton = document.getElementById("myBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

// Topnav
function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "page-header") {
        x.className += " responsive";
    } else {
        x.className = "page-header";
    }
}
