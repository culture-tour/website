import { fetchActivities, fetchSettings, fetchFilters } from './modules/api.js';
import { renderActivities, setupModal, applySiteSettings, renderFilterButtons } from './modules/ui.js';
import { filterActivities } from './modules/filter.js';

document.addEventListener('DOMContentLoaded', () => {
    const activityList = document.getElementById('activity-list');
    const searchInput = document.getElementById('search-input');
    const filterBtnsContainer = document.querySelector('.category-filters');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-btn');

    let allActivities = [];
    let filterBtns = []; // Will be populated after tags are loaded

    // Initialize Modal
    const modalControls = setupModal(modal, modalBody, closeBtn);

    // Load Settings first, then load data
    fetchSettings().then(settings => {
        applySiteSettings(settings);

        // Load Filters after settings
        return fetchFilters();
    }).then(filters => {
        renderFilterButtons(filters, filterBtnsContainer);

        // Attach event listeners to filter dropdowns
        const filterSelects = document.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.addEventListener('change', handleFilter);
        });

        // Load Activities after settings and filters
        return fetchActivities();
    }).then(data => {
        allActivities = data;
        renderActivities(allActivities, activityList, (id) => {
            const activity = allActivities.find(a => a.id === id);
            if (activity) {
                modalControls.show(activity);
            }
        });
    }).catch(error => {
        console.error('Error during initialization:', error);
        const errorText = window.siteSettings?.error_text || '無法載入活動。請稍後再試。';
        activityList.innerHTML = `<p class="error">${errorText}</p>`;
    });

    // Filter Logic
    function handleFilter() {
        const searchTerm = searchInput.value;

        // Collect selected value from each dropdown
        const categories = {};
        document.querySelectorAll('.filter-select').forEach(select => {
            const groupName = select.dataset.group;
            categories[groupName] = select.value;
        });

        const filtered = filterActivities(allActivities, searchTerm, categories);

        renderActivities(filtered, activityList, (id) => {
            const activity = allActivities.find(a => a.id === id);
            if (activity) {
                modalControls.show(activity);
            }
        });
    }

    // Event Listeners
    searchInput.addEventListener('input', handleFilter);
});
