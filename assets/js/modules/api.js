// Hardcoded Google Sheets URL - the single source of truth
const GOOGLE_SHEET_ID = '2PACX-1vQPOaFAfGiupp_lkfD6RfR7PZQ948cKodFUeOQyVTe1hBCksxtwIfThoKwREvL-M1D-nIXvtMigS7Ql';

// Sheet GIDs
const SHEET_GIDS = {
    settings: 0,
    filters: 1240024483,
    activities: 344115867
};

// Build sheet URLs
const SHEET_URLS = {
    settings: `https://docs.google.com/spreadsheets/d/e/${GOOGLE_SHEET_ID}/pub?gid=${SHEET_GIDS.settings}&single=true&output=csv`,
    filters: `https://docs.google.com/spreadsheets/d/e/${GOOGLE_SHEET_ID}/pub?gid=${SHEET_GIDS.filters}&single=true&output=csv`,
    activities: `https://docs.google.com/spreadsheets/d/e/${GOOGLE_SHEET_ID}/pub?gid=${SHEET_GIDS.activities}&single=true&output=csv`
};

// Hardcoded field mapping (Chinese to English)
const FIELD_MAPPING = {
    '標題': 'title',
    '簡介': 'description',
    '完整介紹': 'fullDescription',
    '日期': 'date',
    '地點': 'location',
    '圖片': 'image',
    '標籤': 'tags',
    '價格': 'price',
    '適合年齡': 'age',
    '時長': 'duration',
    '導覽類型': 'tour_type',
    '環境': 'environment'
};

// Hardcoded site settings
const SITE_SETTINGS = {
    site_title: '文化探索',
    page_title: '歷史文化導覽',
    hero_title: '探索歷史',
    hero_subtitle: '透過我們精心策劃的導覽，沉浸在歷史與文化之中。',
    cta_button: '探索活動',
    search_placeholder: '搜尋導覽活動...',
    filter_all: '全部',
    loading_text: '載入活動中...',
    no_results: '找不到符合您條件的活動。',
    error_text: '無法載入活動。請稍後再試。',
    footer_text: '© 2024 文化探索. All rights reserved.',
    modal_date_label: '日期',
    modal_location_label: '地點',
    modal_price_label: '價格',
    modal_book_button: '立即預訂',
    card_details_button: '查看詳情',
    field_mapping: FIELD_MAPPING
};

export async function fetchSettings() {
    try {
        const response = await fetch(SHEET_URLS.settings);
        if (!response.ok) throw new Error('Network response was not ok');
        const csvText = await response.text();
        const rows = parseCSVForSettings(csvText);
        const settings = { ...SITE_SETTINGS }; // Start with hardcoded defaults

        rows.forEach(row => {
            if (row.key && row.value && row.group !== 'field_mapping' && row.group !== 'config') {
                settings[row.key] = row.value;
            }
        });

        return settings;
    } catch (error) {
        console.warn('Error loading Google Sheet settings, using defaults:', error);
        return SITE_SETTINGS;
    }
}

// Simple CSV parser for settings
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

    // Apply field mapping
    headers = headers.map(header => {
        return FIELD_MAPPING[header] || header.toLowerCase();
    });

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
