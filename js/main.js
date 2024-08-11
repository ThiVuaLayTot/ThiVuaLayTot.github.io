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

// Nút Backtotop
let mybutton = document.getElementById("myBtn");

// Khi cuộn xuống 20px
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 30) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// Khi click vào nút 
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

const upButton = document.getElementById("btnDetails");
const updateButton = document.getElementById("buttonDetails");
const cancelButton = document.getElementById("cancel");
const dialog = document.getElementById("typeDialog");
dialog.returnValue = "typeDialog";

function openCheck(dialog) {
    if (dialog.open) {
        console.log("Dialog open");
    } else {
        console.log("Dialog closed");
    }
}

// Update button opens a modeless dialog
updateButton.addEventListener("click", () => {
    dialog.show();
    openCheck(dialog);
});

upButton.addEventListener("click", () => {
  dialog.show();
  openCheck(dialog);
});

// Form cancel button closes the dialog box
cancelButton.addEventListener("click", () => {
    dialog.close("typeNotChosen");
    openCheck(dialog);
});
