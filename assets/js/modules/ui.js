export function renderActivities(activities, container, openModalCallback) {
    container.innerHTML = '';

    if (activities.length === 0) {
        container.innerHTML = '<p class="no-results">找不到符合您條件的活動。</p>';
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
        container.appendChild(card);
    });

    // Add event listeners to new buttons
    container.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            openModalCallback(id);
        });
    });
}

export function setupModal(modal, modalBody, closeBtn) {
    function show(activity) {
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
        document.body.style.overflow = 'hidden';
    }

    function hide() {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', hide);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            hide();
        }
    });

    return { show, hide };
}
