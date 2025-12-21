export function applySiteSettings(settings) {
    // Site settings
    if (settings.site_title) {
        const logo = document.querySelector('.logo');
        if (logo) logo.textContent = settings.site_title;
    }

    if (settings.page_title) {
        document.title = settings.page_title;
    }

    // Hero section
    if (settings.hero_title) {
        const heroTitle = document.querySelector('#hero h1');
        if (heroTitle) heroTitle.textContent = settings.hero_title;
    }

    if (settings.hero_subtitle) {
        const heroSubtitle = document.querySelector('#hero p');
        if (heroSubtitle) heroSubtitle.textContent = settings.hero_subtitle;
    }

    if (settings.cta_button) {
        const ctaBtn = document.querySelector('#hero .primary-btn');
        if (ctaBtn) ctaBtn.textContent = settings.cta_button;
    }

    // Search
    if (settings.search_placeholder) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.placeholder = settings.search_placeholder;
    }

    // Loading
    if (settings.loading_text) {
        const loadingDiv = document.querySelector('.loading');
        if (loadingDiv) loadingDiv.textContent = settings.loading_text;
    }

    // Footer
    if (settings.footer_text) {
        const footerP = document.querySelector('footer p');
        if (footerP) footerP.innerHTML = settings.footer_text;
    }

    // Store settings globally for use in other functions
    window.siteSettings = settings;
}

export function renderFilterButtons(filters, container) {
    if (!container) return;

    container.innerHTML = '';

    // Group filters by their group field
    const groupedFilters = {};
    filters.forEach(filter => {
        const group = filter.group || 'default';
        if (!groupedFilters[group]) {
            groupedFilters[group] = [];
        }
        groupedFilters[group].push(filter);
    });

    // Render each group as a dropdown
    Object.keys(groupedFilters).forEach(groupName => {
        const filterGroup = document.createElement('div');
        filterGroup.className = 'filter-group';
        filterGroup.dataset.group = groupName;

        // Add group label
        const label = document.createElement('label');
        label.className = 'filter-label';
        label.textContent = getGroupLabel(groupName);
        label.htmlFor = `filter-${groupName}`;

        // Add dropdown select
        const select = document.createElement('select');
        select.className = 'filter-select';
        select.id = `filter-${groupName}`;
        select.dataset.group = groupName;

        // Add "All" option
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = window.siteSettings?.filter_all || '全部';
        select.appendChild(allOption);

        // Add filter options
        groupedFilters[groupName].forEach(filter => {
            const option = document.createElement('option');
            option.value = filter.category;
            option.textContent = filter.label;
            select.appendChild(option);
        });

        filterGroup.appendChild(label);
        filterGroup.appendChild(select);
        container.appendChild(filterGroup);
    });
}

function getGroupLabel(groupName) {
    const labels = {
        'location': '地點',
        'price': '費用',
        'age': '適合對象',
        'duration': '導覽時長',
        'tour_type': '導覽類型',
        'environment': '環境',
        'theme': '主題',
        'default': ''
    };
    return labels[groupName] || groupName;
}

export function renderActivities(activities, container, openModalCallback) {
    container.innerHTML = '';

    if (activities.length === 0) {
        const noResultsText = window.siteSettings?.no_results || '找不到符合您條件的活動。';
        container.innerHTML = `<p class="no-results">${noResultsText}</p>`;
        return;
    }

    activities.forEach(activity => {
        const hasLink = activity.link && activity.link !== '#' && activity.link.trim() !== '';
        const card = document.createElement(hasLink ? 'a' : 'div');
        card.className = `activity-card ${hasLink ? '' : 'non-clickable'}`;
        
        if (hasLink) {
            card.href = activity.link;
            card.target = '_blank';
        }
        
        const imageUrl = activity.image || 'assets/images/default.jpg';

        card.innerHTML = `
            <div class="card-bg" style="background-image: url('${imageUrl}')"></div>
            <div class="card-overlay"></div>
            <div class="card-content">
                <h3>${activity.title}</h3>
                <div class="card-meta">
                    <span>📍 ${activity.location}</span>
                    ${activity.organizer ? `<span>🏢 ${activity.organizer}</span>` : ''}
                </div>
                <p class="card-desc">${activity.description}</p>
            </div>
        `;
        container.appendChild(card);
    });

}

export function setupModal(modal, modalBody, closeBtn) {
    function show(activity) {
        const settings = window.siteSettings || {};

        modalBody.innerHTML = `
            <div class="modal-body-content">
                <div class="modal-details">
                    <h2>${activity.title}</h2>
                    <div class="modal-info-grid">
                        <div class="info-item">
                            <strong>${settings.modal_location_label || '地點'}</strong>
                            ${activity.location}
                        </div>
                        ${activity.organizer ? `
                            <div class="info-item">
                                <strong>主辦單位</strong>
                                ${activity.organizer}
                            </div>
                        ` : ''}
                    </div>
                    <p>${activity.description}</p>
                    ${activity.link ? `<a href="${activity.link}" class="btn primary-btn" target="_blank" style="margin-top: 20px; width: 100%; display: block; text-align: center; text-decoration: none;">活動連結</a>` : ''}
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
