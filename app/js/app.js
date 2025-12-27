import { ui } from './ui.js';
import { settings } from './store.js';
import { services } from './data.js';

import { pingServices } from './pingservices.js';

console.log("Dashlet Initialized");

// Initialize Config
settings.loadConfig().then(config => {
    // Smart Sync:
    // 1. Get local services.
    // 2. Identify services in Config that are NOT in Local (by URL).
    // 3. Append new services to Local.
    const localServices = services.getAll();

    if (config && config.services) {
        // Strict Sync: Config is the source of truth.
        // If config.services exists, it overwrites local storage to ensure 
        // deleted items in config are removed from the app.
        const mappedServices = config.services.map((s, i) => ({
            ...s,
            id: s.id || `json-${i}` // Ensure ID consistency relies on config order if ID missing
        }));
        services.sync(mappedServices);
        console.log(`Loaded ${mappedServices.length} services from config.`);
    }

    // Start watching for changes
    pingServices.start();
});
