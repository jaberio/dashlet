import { ui } from './ui.js';
import { settings } from './store.js';
import { services } from './data.js';

console.log("Dashlet Initialized");

// Initialize Config
settings.loadConfig().then(config => {
    // Smart Sync:
    // 1. Get local services.
    // 2. Identify services in Config that are NOT in Local (by URL).
    // 3. Append new services to Local.
    const localServices = services.getAll();

    if (config && config.services) {
        if (localServices.length === 0) {
            // First run or empty: Load all
            const mappedServices = config.services.map((s, i) => ({
                ...s,
                id: s.id || `yaml-${i}`
            }));
            services.replaceAll(mappedServices);
        } else {
            // Merge new ones
            const existingUrls = new Set(localServices.map(s => s.url));
            const newServices = config.services.filter(s => !existingUrls.has(s.url));

            if (newServices.length > 0) {
                const mappedNew = newServices.map((s, i) => ({
                    ...s,
                    id: s.id || `yaml-merge-${Date.now()}-${i}`
                }));
                // Append and save
                const merged = [...localServices, ...mappedNew];
                services.replaceAll(merged);
                console.log(`Added ${mappedNew.length} new services from config.`);
            }
        }
    }
});
