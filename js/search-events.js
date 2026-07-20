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
 * Loads tournament filter states from URL query parameters.
 */
window.loadTournamentFiltersFromURL = function() {
    const params = new URLSearchParams(window.location.search);

    // 1. Search filter
    const searchVal = params.get('search');
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchVal !== null) {
        searchInput.value = searchVal;
    }

    // 2. Sort filter
    const sortVal = params.get('sort');
    const sortSelect = document.getElementById('sortFilter');
    if (sortSelect && sortVal !== null) {
        sortSelect.value = sortVal;
    }

    // 3. Time Class (speed) filter joined by space or plus
    const speedVal = params.get('speed');
    const timeClassGroup = document.getElementById('timeclass-checkbox-group');
    if (timeClassGroup && speedVal !== null) {
        const selectedSpeeds = speedVal.toLowerCase().split(/[\s+]+/);
        const checkboxes = timeClassGroup.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.checked = selectedSpeeds.includes(cb.value.toLowerCase());
        });
    }

    // 4. Variant (var) filter joined by space or plus
    const varVal = params.get('var');
    const variantGroup = document.getElementById('variant-checkbox-group');
    if (variantGroup && varVal !== null) {
        const selectedVars = varVal.toLowerCase().split(/[\s+]+/);
        const checkboxes = variantGroup.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.checked = selectedVars.includes(cb.value.toLowerCase());
        });
    }
};

/**
 * Saves tournament filter states to URL query parameters.
 */
window.saveTournamentFiltersToURL = function() {
    const params = new URLSearchParams();

    // 1. Search filter
    const searchInput = document.getElementById('searchInput');
    const searchVal = (searchInput?.value || '').trim();
    if (searchVal) {
        params.set('search', searchVal);
    }

    // 2. Sort filter
    const sortSelect = document.getElementById('sortFilter');
    if (sortSelect && sortSelect.value !== 'date-desc') {
        params.set('sort', sortSelect.value);
    }

    // 3. Time Class (speed) filter
    const timeClassGroup = document.getElementById('timeclass-checkbox-group');
    if (timeClassGroup) {
        const checked = Array.from(timeClassGroup.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
        const all = Array.from(timeClassGroup.querySelectorAll('input[type="checkbox"]')).map(cb => cb.value);
        if (checked.length < all.length) {
            params.set('speed', checked.join(' '));
        }
    }

    // 4. Variant (var) filter
    const variantGroup = document.getElementById('variant-checkbox-group');
    if (variantGroup) {
        const checked = Array.from(variantGroup.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
        const all = Array.from(variantGroup.querySelectorAll('input[type="checkbox"]')).map(cb => cb.value);
        if (checked.length < all.length) {
            params.set('var', checked.join(' '));
        }
    }

    // Update URL without page reload
    const newQuery = params.toString();
    const newURL = window.location.pathname + (newQuery ? '?' + newQuery : '');
    window.history.replaceState(null, '', newURL);
};

/**
 * Filters and sorts the events table based on search input and dropdown selectors.
 */
window.searchTable = debounce(function() {
    const input = document.getElementById('searchInput');
    if (!input) return;

    // Save state to URL query parameters
    if (typeof window.saveTournamentFiltersToURL === 'function') {
        window.saveTournamentFiltersToURL();
    }

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
