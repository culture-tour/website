import { fetchActivities, fetchSettings, fetchFilters } from './modules/api.js';
import { renderActivities, setupModal, applySiteSettings, renderFilterButtons } from './modules/ui.js';
import { filterActivities } from './modules/filter.js';

document.addEventListener('DOMContentLoaded', () => {
    const activityList = document.getElementById('activity-list');
    const filterBtnsContainer = document.querySelector('.category-filters');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-btn');

    let allActivities = [];

    // Initialize Modal
    const modalControls = setupModal(modal, modalBody, closeBtn);

    // Filter Logic
    function handleFilter() {
        const categories = {};
        document.querySelectorAll('.filter-select').forEach(select => {
            const groupName = select.dataset.group;
            categories[groupName] = select.value;
        });

        // Filter activities based on selected location (search term is empty)
        const filtered = filterActivities(allActivities, '', categories);

        renderActivities(filtered, activityList, (id) => {
            const activity = allActivities.find(a => a.id === id);
            if (activity) {
                modalControls.show(activity);
            }
        });
    }

    // Load Settings, then Filters, then Activities
    fetchSettings().then(settings => {
        applySiteSettings(settings);
        return fetchFilters();
    }).then(filters => {
        // Only show location filter
        const locationFilters = filters.filter(f => f.group === 'location');
        renderFilterButtons(locationFilters, filterBtnsContainer);

        const filterSelects = document.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.addEventListener('change', handleFilter);
        });

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
        if (activityList) activityList.innerHTML = `<p class="error">${errorText}</p>`;
    });
});
