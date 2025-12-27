import { settings } from './store.js';
import { services } from './data.js';

export class PingServices {
    constructor(interval = 5000) {
        this.interval = interval;
        this.lastConfigStr = '';
        this.timer = null;
    }

    start() {
        // Initial check immediately, then interval
        this.check();
        this.timer = setInterval(() => this.check(), this.interval);
        console.log('PingService: Started watching config.json');
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    async check() {
        try {
            // Add timestamp to prevent caching
            const response = await fetch(`public/config.json?t=${Date.now()}`);
            if (!response.ok) return;

            const config = await response.json();
            const configStr = JSON.stringify(config);

            // First run detection
            if (this.lastConfigStr === '') {
                this.lastConfigStr = configStr;
                return;
            }

            // Check for changes
            if (configStr !== this.lastConfigStr) {
                console.log('PingService: Config change detected, reloading...');
                this.lastConfigStr = configStr;
                this.applyConfig(config);
            }

        } catch (e) {
            console.error('PingService: Check failed', e);
        }
    }

    applyConfig(config) {
        // Update Settings
        if (config.settings) {
            // Merge regular settings
            Object.keys(config.settings).forEach(key => {
                const val = config.settings[key];
                // Only overwrite local settings if the config value is NOT empty/null
                // This allows UI validation/local overrides to stick unless explicitly set in config
                if (val !== "" && val !== null && val !== undefined) {
                    settings.set(key, val);
                }
            });
        }

        // Update Services
        if (config.services) {
            const mappedServices = config.services.map((s, i) => ({
                ...s,
                id: s.id || `json-${i}`
            }));
            services.sync(mappedServices);
        }
    }
}

export const pingServices = new PingServices();
