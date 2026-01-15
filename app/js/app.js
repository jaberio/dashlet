import { ui } from './ui.js';
import { settings } from './store.js';
import { services } from './data.js';

import { pingServices } from './pingservices.js';

console.log("Dashlet Initialized - Version: SyncFix-v1");

// Initialize Config
settings.loadConfig().then(config => {
    // Smart Sync:
    // 1. Get local services.
    // 2. Identify services in Config that are NOT in Local (by URL).
    // 3. Append new services to Local.
    const localServices = services.getAll();

    if (config && config.services) {
        const mappedServices = config.services.map((s, i) => ({
            ...s,
            id: s.id || `json-${i}` // Ensure ID consistency relies on config order if ID missing
        }));

        const hasLocal = !!localStorage.getItem('dashlet_services');
        if (hasLocal) {
            // Merge-only: keep local deletions and append new config services
            const localServices = services.getAll();
            const seen = new Set(localServices.map(s => s.id || s.url));
            const merged = [...localServices];

            mappedServices.forEach(service => {
                const key = service.id || service.url;
                if (!seen.has(key)) {
                    merged.push(service);
                    seen.add(key);
                }
            });

            services.replaceAll(merged);
            console.log(`Merged ${mappedServices.length} services from config.`);
        } else {
            // First load: config is the source of truth
            services.sync(mappedServices);
            console.log(`Loaded ${mappedServices.length} services from config.`);
        }
    }

    // Start watching for changes
    pingServices.start();
});
