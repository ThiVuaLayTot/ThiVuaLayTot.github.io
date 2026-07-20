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
 * Filters and sorts the events table based on search input and dropdown selectors.
 */
window.searchTable = debounce(function() {
    const input = document.getElementById('searchInput');
    if (!input) return;

    const filter = input.value.toUpperCase();
    const table = document.querySelector('.styled-table');
    if (!table) return;

    const sortFilterSelect = document.getElementById('sortFilter');
    const timeClassGroup = document.getElementById('timeclass-checkbox-group');
    const variantGroup = document.getElementById('variant-checkbox-group');

    const tbody = document.getElementById('tournament-tbody') || table.querySelector('tbody');
    if (!tbody) return;

    // 1. Sort the table rows first if sortFilter is present and there are loaded rows
    if (sortFilterSelect) {
        const sortVal = sortFilterSelect.value;
        const allRows = Array.from(tbody.querySelectorAll('tr'));
        const loadedRows = allRows.filter(r => r.getAttribute('data-start-time') !== null && !r.classList.contains('not-match'));
        const skeletonRows = allRows.filter(r => r.classList.contains('skeleton-row'));
        const notMatchRow = allRows.find(r => r.classList.contains('not-match'));

        loadedRows.sort((a, b) => {
            if (sortVal === 'date-desc') {
                return (parseInt(b.getAttribute('data-start-time')) || 0) - (parseInt(a.getAttribute('data-start-time')) || 0);
            } else if (sortVal === 'date-asc') {
                return (parseInt(a.getAttribute('data-start-time')) || 0) - (parseInt(b.getAttribute('data-start-time')) || 0);
            } else if (sortVal === 'players-desc') {
                return (parseInt(b.getAttribute('data-players-count')) || 0) - (parseInt(a.getAttribute('data-players-count')) || 0);
            } else if (sortVal === 'players-asc') {
                return (parseInt(a.getAttribute('data-players-count')) || 0) - (parseInt(b.getAttribute('data-players-count')) || 0);
            }
            return 0;
        });

        // Re-append to order them on screen
        loadedRows.forEach(row => tbody.appendChild(row));
        skeletonRows.forEach(row => tbody.appendChild(row));
        if (notMatchRow) tbody.appendChild(notMatchRow);
    }

    const rows = tbody.getElementsByTagName('tr');
    let matched = false;

    // Read checkbox lists
    const checkedTimeClasses = timeClassGroup
        ? Array.from(timeClassGroup.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value)
        : null;

    const checkedVariants = variantGroup
        ? Array.from(variantGroup.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value)
        : null;

    // Iterate through all table rows, skipping 'not-match'
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.classList.contains('not-match')) continue;
        if (row.classList.contains('skeleton-row')) {
            row.style.display = '';
            continue;
        }

        const cells = row.getElementsByTagName('td');

        // 1. Check text search
        let textMatch = false;
        if (!filter) {
            textMatch = true;
        } else {
            for (let j = 0; j < cells.length; j++) {
                const cell = cells[j];
                if (cell && cell.textContent.toUpperCase().indexOf(filter) > -1) {
                    textMatch = true;
                    break;
                }
            }
        }

        // 2. Check time class filter
        let timeClassMatch = true;
        if (checkedTimeClasses !== null) {
            const rowTimeClass = row.getAttribute('data-time-class');
            if (rowTimeClass) {
                // Map lightning/bullet -> bullet, rapid/standard -> rapid, blitz -> blitz, classical -> classical
                let rowMapped = rowTimeClass.toLowerCase();
                if (rowMapped === 'lightning') rowMapped = 'bullet';
                if (rowMapped === 'standard') rowMapped = 'rapid';

                if (!checkedTimeClasses.includes(rowMapped)) {
                    timeClassMatch = false;
                }
            } else {
                timeClassMatch = false;
            }
        }

        // 3. Check variant filter
        let variantMatch = true;
        if (checkedVariants !== null) {
            const rowVariant = row.getAttribute('data-variant');
            if (rowVariant) {
                let rowMapped = rowVariant.toLowerCase();
                if (rowMapped === 'chess') rowMapped = 'standard';

                if (!checkedVariants.includes(rowMapped)) {
                    variantMatch = false;
                }
            } else {
                variantMatch = false;
            }
        }

        const finalMatch = textMatch && timeClassMatch && variantMatch;
        if (finalMatch) {
            row.style.display = '';
            matched = true;
        } else {
            row.style.display = 'none';
        }
    }

    const notMatchRow = tbody.querySelector('.not-match');
    if (notMatchRow) {
        notMatchRow.style.display = matched ? 'none' : '';
    }
}, 100);
