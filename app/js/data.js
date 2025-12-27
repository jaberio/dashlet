const DEFAULT_SERVICES = [
    { id: '1', name: 'GitHub', url: 'https://github.com', icon: 'https://github.githubassets.com/favicons/favicon.png', description: 'Code hosting platform' },
    { id: '2', name: 'YouTube', url: 'https://youtube.com', icon: 'https://www.youtube.com/s/desktop/10c3d9b4/img/favicon_144x144.png', description: 'Video sharing' },
    { id: '3', name: 'Reddit', url: 'https://reddit.com', icon: 'https://www.redditstatic.com/desktop2x/img/favicon/favicon-96x96.png', description: 'Front page of the internet' }
];

export class DataStore {
    constructor() {
        this.STORAGE_KEY = 'zenith_services';
        this.services = this.load();
        this.subscribers = [];
    }

    load() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [...DEFAULT_SERVICES];
        } catch (e) {
            console.error('Failed to load services:', e);
            return [...DEFAULT_SERVICES];
        }
    }

    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.services));
            this.notify();
        } catch (e) {
            console.error('Failed to save services:', e);
        }
    }

    getAll() {
        return this.services;
    }

    add(service) {
        // Simple ID generation
        const newService = { ...service, id: Date.now().toString(36) + Math.random().toString(36).substr(2) };
        this.services.push(newService);
        this.save();
        return newService;
    }

    replaceAll(newServices) {
        this.services = newServices;
        this.save();
        this.notify();
    }

    remove(id) {
        this.services = this.services.filter(s => s.id !== id);
        this.save();
    }

    update(id, data) {
        this.services = this.services.map(s => s.id === id ? { ...s, ...data } : s);
        this.save();
    }

    sync(configServices) {
        // Create a map/set of config IDs for fast lookup
        const configMap = new Map();
        configServices.forEach(s => configMap.set(s.id, s));
        const configIds = new Set(configServices.map(s => s.id));

        const finalList = [];
        const addedIds = new Set(); // Track what we've added to avoid dupes

        // 1. Preserve local order: Iterate local services. 
        // If they exist in config, take the CONFIG version (updated data) but keep LOCAL position.
        this.services.forEach(localS => {
            if (configIds.has(localS.id)) {
                finalList.push(configMap.get(localS.id));
                addedIds.add(localS.id);
            }
            // If local service is NOT in config, it is effectively deleted by the strict sync logic
        });

        // 2. Append new items from config that weren't in local
        configServices.forEach(configS => {
            if (!addedIds.has(configS.id)) {
                finalList.push(configS);
                addedIds.add(configS.id);
            }
        });

        this.services = finalList;
        this.save();
        this.notify();
    }

    reorder(newOrderIds) {
        // specific logic to reorder based on IDs if needed, or just replace array if full list provided
        // implementation depends on UI drag-drop
    }

    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
        };
    }

    notify() {
        this.subscribers.forEach(cb => cb(this.services));
    }
}

export const services = new DataStore();
