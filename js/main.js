function toggleMenu() {
    var x = document.querySelector(".topnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}

// Nút Backtotop
let mybutton = document.getElementById("myBtn");

window.onscroll = function() { scrollFunction() };

function scrollFunction() {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 111) {
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

// Chức năng tìm kiếm
function searchTable() {
    var input = document.getElementById('searchInput');
    var filter = input.value.toUpperCase();
    var table = document.querySelector('.styled-table');
    var rows = table.getElementsByTagName('tr');

    for (var i = 1; i < rows.length; i++) {
        var cells = rows[i].getElementsByTagName('td');
        var match = false;

        for (var j = 0; j < cells.length; j++) {
            var cell = cells[j];
            if (cell) {
                if (cell.textContent.toUpperCase().indexOf(filter) > -1) {
                    match = true;
                    break;
                }
            }
        }

        if (match) {
            rows[i].style.display = '';
        } else {
            rows[i].style.display = 'none';
        }
    }
}