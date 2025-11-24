document.addEventListener('DOMContentLoaded', () => {
    const activityList = document.getElementById('activity-list');
    const searchInput = document.getElementById('search-input');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-btn');

    let allActivities = [];

    // Fetch data
    fetch('data/activities.json')
        .then(response => response.json())
        .then(data => {
            allActivities = data;
            renderActivities(allActivities);
        })
        .catch(error => {
            console.error('Error loading data:', error);
            activityList.innerHTML = '<p class="error">無法載入活動。請稍後再試。</p>';
        });

    // Render activities
    function renderActivities(activities) {
        activityList.innerHTML = '';

        if (activities.length === 0) {
            activityList.innerHTML = '<p class="no-results">找不到符合您條件的活動。</p>';
            return;
        }

        activities.forEach(activity => {
            const card = document.createElement('div');
            card.className = 'activity-card';

            const tagsHtml = activity.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

            card.innerHTML = `
                <div class="card-image">
                    <img src="${activity.image}" alt="${activity.title}" loading="lazy">
                </div>
                <div class="card-content">
                    <h3>${activity.title}</h3>
                    <div class="card-meta">
                        <span>📅 ${activity.date}</span>
                        <span>📍 ${activity.location}</span>
                    </div>
                    <p class="card-desc">${activity.description}</p>
                    <div class="card-tags">
                        ${tagsHtml}
                    </div>
                    <div class="card-footer">
                        <span class="price">${activity.price}</span>
                        <button class="details-btn" data-id="${activity.id}">查看詳情</button>
                    </div>
                </div>
            `;
            activityList.appendChild(card);
        });

        // Add event listeners to new buttons
        document.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                openModal(id);
            });
        });
    }

    // Filter Logic
    function filterActivities() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeCategory = document.querySelector('.filter-btn.active').dataset.category;

        const filtered = allActivities.filter(activity => {
            const matchesSearch = activity.title.toLowerCase().includes(searchTerm) ||
                activity.description.toLowerCase().includes(searchTerm);
            const matchesCategory = activeCategory === 'all' || activity.tags.includes(activeCategory);

            return matchesSearch && matchesCategory;
        });

        renderActivities(filtered);
    }

    // Event Listeners for Filters
    searchInput.addEventListener('input', filterActivities);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add to clicked
            btn.classList.add('active');
            filterActivities();
        });
    });

    // Modal Logic
    function openModal(id) {
        const activity = allActivities.find(a => a.id === id);
        if (!activity) return;

        const tagsHtml = activity.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        modalBody.innerHTML = `
            <div class="modal-body-content">
                <img src="${activity.image}" alt="${activity.title}" class="modal-image">
                <div class="modal-details">
                    <h2>${activity.title}</h2>
                    <div class="modal-info-grid">
                        <div class="info-item">
                            <strong>日期</strong>
                            ${activity.date}
                        </div>
                        <div class="info-item">
                            <strong>地點</strong>
                            ${activity.location}
                        </div>
                        <div class="info-item">
                            <strong>價格</strong>
                            ${activity.price}
                        </div>
                    </div>
                    <div class="card-tags" style="margin-bottom: 20px;">
                        ${tagsHtml}
                    </div>
                    <p>${activity.fullDescription}</p>
                    <button class="btn primary-btn" style="margin-top: 20px; width: 100%;">立即預訂</button>
                </div>
            </div>
        `;

        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closeModal() {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});
