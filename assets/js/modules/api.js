export async function fetchActivities() {
    try {
        const response = await fetch('data/activities.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}
