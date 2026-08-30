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

// ========== Filter Configuration ==========
/**
 * Centralized filter configuration to reduce duplication
 */
const FILTER_CONFIG = {
    search: {
        elementId: 'searchInput',
        paramName: 'search',
        getValue: (el) => (el?.value || '').trim(),
        setValue: (el, val) => { if (el) el.value = val; },
        shouldSave: (val) => !!val,
        isSaved: (val, default_val) => val !== default_val
    },
    sort: {
        elementId: 'sortFilter',
        paramName: 'sort',
        getValue: (el) => el?.value,
        setValue: (el, val) => { if (el) el.value = val; },
        shouldSave: (val) => val !== 'date-desc',
        isSaved: (val, default_val) => val !== default_val
    },
    speed: {
        groupId: 'timeclass-checkbox-group',
        paramName: 'speed',
        separator: ' '
    },
    variant: {
        groupId: 'variant-checkbox-group',
        paramName: 'var',
        separator: ' '
    },
    format: {
        groupId: 'format-checkbox-group',
        paramName: 'format',
        separator: ' '
    },
    premium: {
        elementId: 'premiumToggle',
        paramName: 'premium',
        getValue: (el) => el?.checked ?? true,
        setValue: (el, val) => { if (el) el.checked = (val !== '0' && val !== false); },
        shouldSave: (val) => !val,
        isSaved: (val, default_val) => val !== default_val
    }
};

// ========== Helper Functions ==========

/**
 * Gets checked checkbox values from a group
 * @param {string} groupId - The container element ID
 * @returns {Array<string>} Array of checked values
 */
function getCheckedValues(groupId) {
    const group = document.getElementById(groupId);
    if (!group) return [];
    return Array.from(group.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
}

/**
 * Gets all checkbox values from a group
 * @param {string} groupId - The container element ID
 * @returns {Array<string>} Array of all values
 */
function getAllCheckboxValues(groupId) {
    const group = document.getElementById(groupId);
    if (!group) return [];
    return Array.from(group.querySelectorAll('input[type="checkbox"]')).map(cb => cb.value);
}

/**
 * Sets checkbox states from array of values
 * @param {string} groupId - The container element ID
 * @param {Array<string>} values - Values to check
 */
function setCheckboxValues(groupId, values) {
    const group = document.getElementById(groupId);
    if (!group) return;
    const checkboxes = group.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = values.includes(cb.value.toLowerCase());
    });
}

/**
 * Processes checkbox group for URL parameter handling
 * @param {Object} config - Filter config object with groupId, paramName, separator
 * @returns {Object} { checked: Array, all: Array, shouldSave: boolean }
 */
function processCheckboxGroup(config) {
    const checked = getCheckedValues(config.groupId);
    const all = getAllCheckboxValues(config.groupId);
    return {
        checked,
        all,
        shouldSave: checked.length < all.length // Only save if not all checked
    };
}

/**
 * Parse multiple checkbox values from URL parameter string
 * @param {string} paramValue - URL parameter value (space or + separated)
 * @returns {Array<string>} Parsed values
 */
function parseCheckboxParam(paramValue) {
    return paramValue.toLowerCase().split(/[\s+]+/).filter(Boolean);
}

// ========== URL Parameter Functions ==========

/**
 * Loads tournament filter states from URL query parameters.
 */
window.loadTournamentFiltersFromURL = function() {
    const params = new URLSearchParams(window.location.search);

    // Process single-element filters (search, sort, premium)
    Object.entries(FILTER_CONFIG).forEach(([key, config]) => {
        if (config.elementId) {
            const element = document.getElementById(config.elementId);
            const paramValue = params.get(config.paramName);
            if (element && paramValue !== null) {
                config.setValue(element, paramValue);
            }
        }
    });

    // Process checkbox group filters (speed, variant, format)
    Object.entries(FILTER_CONFIG).forEach(([key, config]) => {
        if (config.groupId) {
            const paramValue = params.get(config.paramName);
            if (paramValue !== null) {
                const values = parseCheckboxParam(paramValue);
                setCheckboxValues(config.groupId, values);
            }
        }
    });
};

/**
 * Saves tournament filter states to URL query parameters.
 */
window.saveTournamentFiltersToURL = function() {
    const params = new URLSearchParams();

    // Process single-element filters
    Object.entries(FILTER_CONFIG).forEach(([key, config]) => {
        if (config.elementId) {
            const element = document.getElementById(config.elementId);
            if (element) {
                const value = config.getValue(element);
                if (config.shouldSave(value)) {
                    params.set(config.paramName, value);
                }
            }
        }
    });

    // Process checkbox group filters
    Object.entries(FILTER_CONFIG).forEach(([key, config]) => {
        if (config.groupId) {
            const { checked, all, shouldSave } = processCheckboxGroup(config);
            if (shouldSave) {
                params.set(config.paramName, checked.join(config.separator));
            }
        }
    });

    // Update URL without page reload
    const newQuery = params.toString();
    const newURL = window.location.pathname + (newQuery ? '?' + newQuery : '');
    window.history.replaceState(null, '', newURL);
};

// ========== Filter Functions ==========

/**
 * Toggles the visibility of Premium user badges inside tbody.
 */
window.togglePremium = function() {
    const premiumToggle = document.getElementById('premiumToggle');
    const checked = premiumToggle?.checked ?? true;
    const tbody = document.getElementById('tournament-tbody');
    if (tbody) {
        tbody.classList.toggle('hide-premium', !checked);
    }
};

/**
 * Mapping for filter values to normalize data attributes
 */
const FILTER_MAPPINGS = {
    timeclass: {
        'lightning': 'bullet',
        'standard': 'rapid'
    },
    variant: {
        'chess': 'standard'
    }
};

/**
 * Normalizes a filter value using predefined mappings
 * @param {string} filterType - Type of filter (timeclass, variant, etc)
 * @param {string} value - Value to normalize
 * @returns {string} Normalized value
 */
function normalizeFilterValue(filterType, value) {
    if (!value) return value;
    const mapping = FILTER_MAPPINGS[filterType];
    return mapping ? (mapping[value.toLowerCase()] || value.toLowerCase()) : value.toLowerCase();
}

/**
 * Checks if a row matches the given filter criteria
 * @param {HTMLTableRowElement} row - Table row element
 * @param {Object} filters - Filter state object
 * @returns {boolean} True if row matches all filters
 */
function rowMatchesFilters(row, filters) {
    // Text match check
    if (!filters.textMatch(row)) return false;

    // Attribute-based filters
    const attributeFilters = [
        { attr: 'data-time-class', checked: filters.timeClass, normalize: (v) => normalizeFilterValue('timeclass', v) },
        { attr: 'data-variant', checked: filters.variant, normalize: (v) => normalizeFilterValue('variant', v) },
        { attr: 'data-format', checked: filters.format, normalize: (v) => v.toLowerCase() },
        { attr: 'data-status', checked: filters.cttqStatus, normalize: (v) => v }
    ];

    for (const filter of attributeFilters) {
        if (filter.checked === null) continue; // Filter not active
        
        const rowAttrValue = row.getAttribute(filter.attr);
        if (!rowAttrValue) return false;
        
        const normalized = filter.normalize(rowAttrValue);
        if (!filter.checked.includes(normalized)) return false;
    }

    return true;
}

/**
 * Filters and sorts the events table based on search input and dropdown selectors.
 */
window.searchTable = debounce(function() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    // Toggle premium badges
    if (typeof window.togglePremium === 'function') {
        window.togglePremium();
    }

    // Save state to URL
    if (typeof window.saveTournamentFiltersToURL === 'function') {
        window.saveTournamentFiltersToURL();
    }

    const searchFilter = searchInput.value.toUpperCase();
    const table = document.querySelector('.styled-table');
    if (!table) return;

    const tbody = document.getElementById('tournament-tbody') || table.querySelector('tbody');
    if (!tbody) return;

    // Prepare filter state
    const sortValue = document.getElementById('sortFilter')?.value || 'date-desc';
    const timeClassChecked = getCheckedValues('timeclass-checkbox-group');
    const variantChecked = getCheckedValues('variant-checkbox-group');
    const formatChecked = getCheckedValues('format-checkbox-group');
    const cttqStatusValue = document.getElementById('cttq-status-filter')?.value || 'all';

    // Sort rows
    const allRows = Array.from(tbody.querySelectorAll('tr'));
    const loadedRows = allRows.filter(r => r.getAttribute('data-start-time') !== null && !r.classList.contains('not-match'));
    const skeletonRows = allRows.filter(r => r.classList.contains('skeleton-row'));
    const notMatchRow = allRows.find(r => r.classList.contains('not-match'));

    // Sort mapping
    const sortComparators = {
        'date-desc': (a, b) => (parseInt(b.getAttribute('data-start-time')) || 0) - (parseInt(a.getAttribute('data-start-time')) || 0),
        'date-asc': (a, b) => (parseInt(a.getAttribute('data-start-time')) || 0) - (parseInt(b.getAttribute('data-start-time')) || 0),
        'players-desc': (a, b) => (parseInt(b.getAttribute('data-players-count')) || 0) - (parseInt(a.getAttribute('data-players-count')) || 0),
        'players-asc': (a, b) => (parseInt(a.getAttribute('data-players-count')) || 0) - (parseInt(b.getAttribute('data-players-count')) || 0),
        'tours-desc': (a, b) => (parseInt(b.getAttribute('data-tours-count')) || 0) - (parseInt(a.getAttribute('data-tours-count')) || 0),
        'tours-asc': (a, b) => (parseInt(a.getAttribute('data-tours-count')) || 0) - (parseInt(b.getAttribute('data-tours-count')) || 0)
    };

    const comparator = sortComparators[sortValue];
    if (comparator) {
        loadedRows.sort(comparator);
        loadedRows.forEach(row => tbody.appendChild(row));
        skeletonRows.forEach(row => tbody.appendChild(row));
        if (notMatchRow) tbody.appendChild(notMatchRow);
    }

    // Apply filters
    const filters = {
        textMatch: (row) => {
            if (!searchFilter) return true;
            const cells = row.getElementsByTagName('td');
            for (const cell of cells) {
                if (cell.textContent.toUpperCase().indexOf(searchFilter) > -1) {
                    return true;
                }
            }
            return false;
        },
        timeClass: timeClassChecked.length < getAllCheckboxValues('timeclass-checkbox-group').length ? timeClassChecked : null,
        variant: variantChecked.length < getAllCheckboxValues('variant-checkbox-group').length ? variantChecked : null,
        format: formatChecked.length < getAllCheckboxValues('format-checkbox-group').length ? formatChecked : null,
        cttqStatus: cttqStatusValue !== 'all' ? [cttqStatusValue] : null
    };

    let matchedCount = 0;
    const rows = tbody.getElementsByTagName('tr');

    for (const row of rows) {
        if (row.classList.contains('not-match')) continue;
        
        if (row.classList.contains('skeleton-row')) {
            row.style.display = '';
            continue;
        }

        const matches = rowMatchesFilters(row, filters);
        row.style.display = matches ? '' : 'none';
        if (matches) matchedCount++;
    }

    // Show/hide no-match message
    if (notMatchRow) {
        notMatchRow.style.display = matchedCount === 0 ? '' : 'none';
    }
}, 100);

/**
 * Toggles visibility of tour dropdown boxes.
 */
window.toggleTourDropdown = function(id) {
    const element = document.getElementById(id);
    if (!element) return;

    // Close all other dropdowns
    document.querySelectorAll('.tour-dropdown').forEach(dropdown => {
        if (dropdown.id !== id) dropdown.classList.remove('open');
    });

    element.classList.toggle('open');
};

// Close dropdowns on click outside
window.addEventListener('click', (e) => {
    if (!e.target.closest('.tour-dropdown')) {
        document.querySelectorAll('.tour-dropdown').forEach(dropdown => dropdown.classList.remove('open'));
    }
});
