// URLs will be loaded from settings
let SHEET_URLS = {
    settings: 'YOUR_GOOGLE_SHEET_SETTINGS_URL_HERE',
    filters: 'YOUR_GOOGLE_SHEET_FILTERS_URL_HERE',
    activities: 'YOUR_GOOGLE_SHEET_ACTIVITIES_URL_HERE'
};

// Function to update URLs from settings
export function updateSheetURLs(settings) {
    if (settings.sheet_filters_url) SHEET_URLS.filters = settings.sheet_filters_url;
    if (settings.sheet_activities_url) SHEET_URLS.activities = settings.sheet_activities_url;
}

export async function fetchSettings() {
    // Always try local settings first to get URLs
    const localSettings = await fetchLocalSettings();

    // Update URLs from local settings
    updateSheetURLs(localSettings);

    // If settings URL is configured, fetch from Google Sheets
    if (SHEET_URLS.settings !== 'YOUR_GOOGLE_SHEET_SETTINGS_URL_HERE') {
        try {
            const response = await fetch(SHEET_URLS.settings);
            if (!response.ok) throw new Error('Network response was not ok');
            const csvText = await response.text();
            const rows = parseCSV(csvText);
            const settings = {};
            rows.forEach(row => {
                if (row.key && row.value) {
                    settings[row.key] = row.value;
                }
            });
            // Update URLs again from remote settings
            updateSheetURLs(settings);
            return settings;
        } catch (error) {
            console.error('Error loading Google Sheet settings:', error);
            return localSettings;
        }
    }

    return localSettings;
}

async function fetchLocalSettings() {
    try {
        const response = await fetch('data/settings.csv');
        if (!response.ok) throw new Error('Network response was not ok');
        const csvText = await response.text();
        const rows = parseCSVForSettings(csvText);
        const settings = {};
        const fieldMapping = {};

        rows.forEach(row => {
            if (row.key && row.value) {
                if (row.group === 'field_mapping') {
                    // Store field mapping separately
                    fieldMapping[row.key] = row.value;
                } else {
                    settings[row.key] = row.value;
                }
            }
        });

        // Add field mapping to settings
        if (Object.keys(fieldMapping).length > 0) {
            settings.field_mapping = fieldMapping;
        }

        return settings;
    } catch (error) {
        console.error('Error loading local settings:', error);
        return {};
    }
}

// Simple CSV parser for settings (before main parseCSV is available)
function parseCSVForSettings(csvText) {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    const results = [];
    for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 3) {
            results.push({
                group: parts[0].trim(),
                key: parts[1].trim(),
                value: parts[2].trim()
            });
        }
    }
    return results;
}

export async function fetchFilters() {
    // Fallback to local CSV if URL is not set
    if (SHEET_URLS.filters === 'YOUR_GOOGLE_SHEET_FILTERS_URL_HERE') {
        console.warn('Google Sheet Filters URL not set. Falling back to local CSV.');
        try {
            const response = await fetch('data/filters.csv');
            if (!response.ok) throw new Error('Network response was not ok');
            const csvText = await response.text();
            return parseCSV(csvText);
        } catch (error) {
            console.error('Error loading local filters:', error);
            return [];
        }
    }

    try {
        const response = await fetch(SHEET_URLS.filters);
        if (!response.ok) throw new Error('Network response was not ok');
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error('Error loading Google Sheet filters:', error);
        return [];
    }
}

export async function fetchActivities() {
    // Fallback to local JSON if URL is not set
    if (SHEET_URLS.activities === 'YOUR_GOOGLE_SHEET_ACTIVITIES_URL_HERE') {
        console.warn('Google Sheet URL not set. Falling back to local JSON.');
        try {
            const response = await fetch('data/activities.json');
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error loading local data:', error);
            throw error;
        }
    }

    try {
        const response = await fetch(SHEET_URLS.activities);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error('Error loading Google Sheet data:', error);
        throw error;
    }
}

function parseCSV(csvText) {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    let headers = parseCSVLine(lines[0]).map(h => h.trim());

    // Apply field mapping if available (from settings)
    if (window.siteSettings && window.siteSettings.field_mapping) {
        const mapping = window.siteSettings.field_mapping;
        headers = headers.map(header => {
            // If there's a mapping for this Chinese header, use the English field name
            return mapping[header] || header.toLowerCase();
        });
    } else {
        // Fallback: just lowercase the headers
        headers = headers.map(h => h.toLowerCase());
    }

    const results = [];

    for (let i = 1; i < lines.length; i++) {
        const currentLine = parseCSVLine(lines[i]);

        if (currentLine.length === headers.length) {
            const obj = {};

            // Auto-generate ID based on index
            obj.id = i;

            headers.forEach((header, index) => {
                let value = currentLine[index].trim();

                // Handle specific fields
                if (header === 'tags' || header === '標籤') {
                    // Split tags by comma and trim whitespace
                    value = value ? value.split(',').map(tag => tag.trim()) : [];
                } else if (header === 'image' || header === '圖片') {
                    // Handle image path
                    if (!value) {
                        value = 'assets/images/default.png';
                    } else if (!value.startsWith('http') && !value.startsWith('assets/')) {
                        // Assume it's a filename in assets/images/
                        value = `assets/images/${value}`;
                    }
                }

                obj[header] = value;
            });

            results.push(obj);
        }
    }

    return results;
}

// Helper to handle quoted fields in CSV
function parseCSVLine(text) {
    const result = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(cell);
            cell = '';
        } else {
            cell += char;
        }
    }
    result.push(cell);

    // Remove surrounding quotes if present
    return result.map(c => {
        if (c.startsWith('"') && c.endsWith('"')) {
            return c.slice(1, -1).replace(/""/g, '"'); // Handle escaped quotes
        }
        return c;
    });
}
