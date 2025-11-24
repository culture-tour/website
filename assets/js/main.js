import { fetchActivities } from './modules/api.js';
import { renderActivities, setupModal } from './modules/ui.js';
import { filterActivities } from './modules/filter.js';

document.addEventListener('DOMContentLoaded', () => {
    const activityList = document.getElementById('activity-list');
    const searchInput = document.getElementById('search-input');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-btn');

    let allActivities = [];

    // Initialize Modal
    const modalControls = setupModal(modal, modalBody, closeBtn);

    // Load Data
    fetchActivities()
        .then(data => {
            allActivities = data;
            renderActivities(allActivities, activityList, (id) => {
                const activity = allActivities.find(a => a.id === id);
                if (activity) {
                    modalControls.show(activity);
                }
            });
        })
        .catch(error => {
            activityList.innerHTML = '<p class="error">無法載入活動。請稍後再試。</p>';
        });

    // Filter Logic
    function handleFilter() {
        const searchTerm = searchInput.value;
        const activeCategory = document.querySelector('.filter-btn.active').dataset.category;

        const filtered = filterActivities(allActivities, searchTerm, activeCategory);

        renderActivities(filtered, activityList, (id) => {
            const activity = allActivities.find(a => a.id === id);
            if (activity) {
                modalControls.show(activity);
            }
        });
    }

    // Event Listeners
    searchInput.addEventListener('input', handleFilter);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            handleFilter();
        });
    });
});
