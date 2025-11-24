export function filterActivities(activities, searchTerm, categories) {
    const term = searchTerm.toLowerCase();

    return activities.filter(activity => {
        const matchesSearch = activity.title.toLowerCase().includes(term) ||
            activity.description.toLowerCase().includes(term);

        // Check each category group
        let matchesCategories = true;
        for (const [group, category] of Object.entries(categories)) {
            if (category !== 'all') {
                // Location filter
                if (group === 'location') {
                    matchesCategories = matchesCategories && activity.location && activity.location.includes(category);
                }
                // Price filter
                else if (group === 'price') {
                    matchesCategories = matchesCategories && matchesPriceRange(activity.price, category);
                }
                // Age filter
                else if (group === 'age') {
                    matchesCategories = matchesCategories && activity.age && activity.age.includes(category);
                }
                // Duration filter
                else if (group === 'duration') {
                    matchesCategories = matchesCategories && activity.duration && activity.duration === category;
                }
                // Tour type filter
                else if (group === 'tour_type') {
                    matchesCategories = matchesCategories && activity.tour_type && activity.tour_type.includes(category);
                }
                // Environment filter
                else if (group === 'environment') {
                    matchesCategories = matchesCategories && activity.environment && activity.environment.includes(category);
                }
                // Theme filter (multi-select support)
                else if (group === 'theme') {
                    matchesCategories = matchesCategories && activity.tags && activity.tags.includes(category);
                }
            }
        }

        return matchesSearch && matchesCategories;
    });
}

function matchesPriceRange(priceStr, range) {
    if (!priceStr) return false;

    // Extract numeric value from price string (e.g., "$25" -> 25)
    const price = parseInt(priceStr.replace(/[^0-9]/g, ''));
    if (isNaN(price)) return false;

    switch (range) {
        case '0-300': return price >= 0 && price <= 300;
        case '300-500': return price > 300 && price <= 500;
        case '500-800': return price > 500 && price <= 800;
        case '800-1000': return price > 800 && price <= 1000;
        case '1000-1200': return price > 1000 && price <= 1200;
        case '1200+': return price > 1200;
        default: return false;
    }
}
