function toggleMenu() {
    var x = document.querySelector(".topnav");
    if (x.className === "topnav") {
      x.className += " responsive";
    } else {
      x.className = "topnav";
    }
}


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

setDarkMode(isDarkMode);
darkModeToggle.checked = isDarkMode;
darkModeToggle.addEventListener('change', toggleDarkMode);

// Nút Backtotop
let mybutton = document.getElementById("myBtn");

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

const updateButton = document.getElementById("buttonDetails");
const upButton = document.getElementById("btnDetails");
const callDialog = document.getElementById("callDialog");
const donateDialog = document.getElementById("donateDialog");
const cancelCallButton = document.getElementById("cancelCall");
const cancelDonateButton = document.getElementById("cancelDonate");

function openCheck(dialog) {
    console.log(dialog.open ? "Dialog open" : "Dialog closed");
}

function setupDialog(button, dialog, cancelButton) {
    button.addEventListener("click", () => {
        dialog.showModal();
        openCheck(dialog);
    });
    cancelButton.addEventListener("click", () => {
        dialog.close("typeNotChosen");
        openCheck(dialog);
    });
}

setupDialog(updateButton, callDialog, cancelCallButton);
setupDialog(upButton, donateDialog, cancelDonateButton);
