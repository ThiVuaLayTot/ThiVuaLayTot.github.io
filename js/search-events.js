/**
 * Debounce helper to limit the frequency of function execution.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The delay in milliseconds.
 * @returns {Function}
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Filters the events table based on the user's search input.
 * Searches across all columns and toggles row visibility.
 */
window.searchTable = debounce(function() {
    const input = document.getElementById('searchInput');
    if (!input) return;

    const filter = input.value.toUpperCase();
    const table = document.querySelector('.styled-table');

    if (!table) return;

    const rows = table.getElementsByTagName('tr');

    // Iterate through all table rows, skipping the header (i=1)
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        let match = false;

        // Check if any cell in the row matches the search filter
        for (let j = 0; j < cells.length; j++) {
            const cell = cells[j];
            if (cell && cell.textContent.toUpperCase().indexOf(filter) > -1) {
                match = true;
                break;
            }
        }

        // Toggle row visibility based on match result
        rows[i].style.display = match ? '' : 'none';
    }
}, 500);
