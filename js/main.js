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

var btn = ('#back2top');
$(window).scroll(function () {
	if ($(window).scrollTop() > 300) {
		btn.addClass('show');
	} else {
		btn.removeClass('show');
	}
});

btn.on('click', function (e) {
	e.preventDefault();
	$('html, body').animate({ scrollTop: 0 }, '800');
});
