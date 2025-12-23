const DEFAULT_SETTINGS = {
    theme: 'system', // system, dark, light
    accentColor: '#3b82f6',
    blur: true,
    animations: true,
    openNewTab: true,
    layout: 'grid', // grid, list
    wallpaper: '',
    searchProvider: 'https://duckduckgo.com/?q=',
    weatherEnabled: false,
    weatherLocation: '',
    customCSS: ''
};

export class SettingsStore {
    constructor() {
        this.STORAGE_KEY = 'dashlet_settings';
        this.settings = this.load();
        this.subscribers = [];
    }

    async loadConfig() {
        try {
            const response = await fetch('user/config.yaml');
            if (response.ok) {
                const text = await response.text();
                // Check if jsyaml is available (loaded via script tag)
                if (window.jsyaml) {
                    const config = window.jsyaml.load(text);
                    if (config && config.settings) {
                        // Merge YAML settings with current (localStorage takes precedence? Or YAML?)
                        // User request: "config.yaml for all app config and changes on ui will also change config"
                        // Since we can't write to file from browser easily without server API, 
                        // we'll treat YAML as "defaults" that override everything on load, OR localStorage overrides YAML.
                        // Usually YAML is persistent source of truth if editable.
                        // But we also have localStorage. 
                        // Let's say: YAML > Defaults. LocalStorage > YAML.
                        // Wait, "changes on the ui will also change the config". 
                        // We can't write to disk. We can only "Export".
                        // So, we'll implement "Export Config".

                        // Phase 3 Persistence Fix:
                        // 1. YAML config is the "Base" defaults.
                        // 2. localStorage is the "User Overrides".
                        // So we should apply Config first, then re-apply stored settings on top.

                        this.settings = { ...DEFAULT_SETTINGS, ...config.settings, ...this.load() };

                        // Note: this.load() reads from localStorage again to ensure we layer it on top.
                        this.save(); // Sync merged state back
                        this.notify();
                    }
                    return config; // Return full config for other stores
                }
            }
        } catch (e) {
            console.error('Failed to load config.yaml:', e);
        }
        return null;
    }

    load() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : { ...DEFAULT_SETTINGS };
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
