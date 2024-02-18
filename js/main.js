const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;
const icon = document.getElementById('icon');
const isDarkMode = localStorage.getItem('darkMode') === 'enabled';

function toggleDarkMode() {
    if (darkModeToggle.checked) {
        body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
        icon.classList.add('bx', 'bxs-sun');
        icon.classList.remove('bx', 'bxs-moon');
    } else {
        body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
        icon.classList.remove('bx', 'bxs-sun');
        icon.classList.add('bx', 'bxs-moon');
    }
}

if (isDarkMode) {
    toggleDarkMode();
    darkModeToggle.checked = false;
}

darkModeToggle.addEventListener('change', toggleDarkMode);

        var btn = $('#back2top');
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
