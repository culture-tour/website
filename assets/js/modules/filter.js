export function filterActivities(activities, searchTerm, category) {
    const term = searchTerm.toLowerCase();

    return activities.filter(activity => {
        const matchesSearch = activity.title.toLowerCase().includes(term) ||
            activity.description.toLowerCase().includes(term);
        const matchesCategory = category === 'all' || activity.tags.includes(category);

        return matchesSearch && matchesCategory;
    });
}
