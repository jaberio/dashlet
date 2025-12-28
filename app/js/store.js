const DEFAULT_SETTINGS = {
    theme: 'system', // system, dark, light
    appTitle: 'Dashlet',
    greeting: 'Welcome',
    accentColor: '#3b82f6',
    blur: true,
    animations: true,
    openNewTab: true,
    layout: 'grid', // grid, list
    wallpaper: '',
    searchProvider: 'https://duckduckgo.com/?q=',
    customCSS: '',
    disableDragDrop: false,
    dragDelay: 0,
    searchEnabled: true,
    footerText: 'Powered by',
    footerColor: ''
};

export class SettingsStore {
    constructor() {
        this.STORAGE_KEY = 'dashlet_settings';
        this.settings = this.load();
        this.subscribers = [];
    }

    async loadConfig() {
        try {
            const response = await fetch(`public/config.json?t=${Date.now()}`);
            if (response.ok) {
                const config = await response.json();
                if (config && config.settings) {
                    const merged = { ...DEFAULT_SETTINGS, ...config.settings, ...this.load() };
                    // Purge legacy weather keys
                    delete merged.weatherEnabled;
                    delete merged.weatherLocation;
                    delete merged.weatherProvider;
                    this.settings = merged;
                    this.save();
                    this.notify();
                }
                return config;
            }
        } catch (e) {
            console.error('Failed to load config.json:', e);
        }
        return null;
    }

    load() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            const settings = stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : { ...DEFAULT_SETTINGS };
            // Purge legacy weather keys
            delete settings.weatherEnabled;
            delete settings.weatherLocation;
            delete settings.weatherProvider;
            if (settings.footerText === 'Powered by Dashlet') {
                settings.footerText = 'Powered by';
            }
            return settings;
        } catch (e) {
            console.error('Failed to load settings:', e);
            return { ...DEFAULT_SETTINGS };
        }
    }

    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
            this.notify();
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }

    get(key) {
        return this.settings[key];
    }

    set(key, value) {
        this.settings[key] = value;
        this.save();
    }

    reset() {
        this.settings = { ...DEFAULT_SETTINGS };
        this.save();
    }

    export() {
        return JSON.stringify(this.settings, null, 2);
    }

    import(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            // Basic validation: ensure it's an object
            if (typeof data === 'object' && data !== null) {
                // Merge valid keys only
                Object.keys(DEFAULT_SETTINGS).forEach(key => {
                    if (data.hasOwnProperty(key)) {
                        this.settings[key] = data[key];
                    }
                });
                this.save();
                return true;
            }
        } catch (e) {
            console.error('Import failed:', e);
        }
        return false;
    }

    // Simple pub/sub for reactive UI updates
    subscribe(callback) {
        this.subscribers.push(callback);
        // Return unsubscribe function
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
        };
    }

    notify() {
        this.subscribers.forEach(cb => cb(this.settings));
    }
}

export const settings = new SettingsStore();
