import { settings } from './store.js';
import { services } from './data.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { ServiceCard } from './components/ServiceCard.js';
import { SettingsModal } from './components/SettingsModal.js';

export class UI {
    constructor() {
        this.app = document.getElementById('app');
        this.init();
    }

    init() {
        this.app.classList.add('app-layout');
        // Initial Layout
        this.app.innerHTML = `
            ${Header(settings.settings)}
            <main id="main-content">
                <div class="content-grid" id="grid"></div>
            </main>
            ${Footer()}
            <div id="modal-container"></div>
        `;

        this.setupListeners();

        // Subscribe to changes
        services.subscribe(() => this.renderServices());
        settings.subscribe((newSettings) => {
            this.applySettings(newSettings);
            this.renderServices();
        });

        // Initial Render
        this.renderServices();
        this.applySettings(settings.settings);
        this.initSearch();
        this.initWeather();
    }

    updateHeaderText(s) {
        const logo = document.querySelector('.logo');
        if (logo) logo.textContent = s.appTitle || 'Dashlet';

        // Update Layout Icon
        const btnLayout = document.getElementById('btn-layout');
        if (btnLayout) {
            const icon = btnLayout.querySelector('span');
            if (icon) icon.textContent = s.layout === 'list' ? 'grid_view' : 'view_list';
        }
    }

    renderServices() {
        const grid = document.getElementById('grid');
        const allServices = services.getAll();
        const currentSettings = settings.settings;

        if (allServices.length === 0) {
            grid.innerHTML = '<div class="empty-state">No services added yet.</div>';
            return;
        }

        grid.innerHTML = allServices.map(s => ServiceCard(s, currentSettings)).join('');

        // Init/Re-init Sortable
        if (this.sortable) this.sortable.destroy();
        if (currentSettings.disableDragDrop) return;

        this.sortable = new Sortable(grid, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            delay: currentSettings.dragDelay || 0,
            delayOnTouchOnly: true,
            onEnd: (evt) => {
                const ids = Array.from(grid.children).map(el => el.getAttribute('data-id'));
                const reordered = ids.map(id => allServices.find(s => s.id === id)).filter(Boolean);

                if (reordered.length === allServices.length) {
                    services.replaceAll(reordered);
                }
            }
        });
    }

    setupListeners() {
        // App Delegation for dynamic elements
        this.app.addEventListener('click', (e) => {
            const btnSettings = e.target.closest('#btn-settings');
            if (btnSettings) this.openSettings();

            const btnLayout = e.target.closest('#btn-layout');
            if (btnLayout) {
                const current = settings.get('layout') || 'grid';
                const next = current === 'list' ? 'grid' : 'list';
                settings.set('layout', next);
            }
        });

        // Search Input Listener
        this.app.addEventListener('keydown', (e) => {
            if (e.target.id === 'app-search' && e.key === 'Enter') {
                this.performSearch(e.target.value);
            }
        });
    }

    initSearch() {
        // Any specific search init logic if needed
    }

    performSearch(query) {
        if (!query) return;
        const provider = settings.get('searchProvider');
        if (!provider) return;

        let url = provider;
        if (url.includes('%s')) {
            url = url.replace('%s', encodeURIComponent(query));
        } else {
            url += encodeURIComponent(query);
        }
        window.open(url, settings.get('openNewTab') ? '_blank' : '_self');
    }

    async initWeather() {
        const s = settings.settings;
        const widget = document.getElementById('weather-widget');
        if (!widget) return;

        if (!s.weatherEnabled || !s.weatherLocation) {
            widget.innerHTML = '';
            return;
        }

        try {
            let lat, lon;
            const loc = s.weatherLocation.trim();

            // Try to parse as Coords (Lat,Lon)
            if (loc.includes(',') && !isNaN(loc.split(',')[0])) {
                [lat, lon] = loc.split(',').map(c => c.trim());
            } else {
                // Try Geocoding (City Name)
                const geoResp = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(loc)}&count=1&language=en&format=json`);
                const geoData = await geoResp.json();
                if (geoData.results && geoData.results.length > 0) {
                    lat = geoData.results[0].latitude;
                    lon = geoData.results[0].longitude;
                } else {
                    throw new Error('City not found');
                }
            }

            const resp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const data = await resp.json();

            if (data.current_weather) {
                const temp = Math.round(data.current_weather.temperature);
                widget.innerHTML = `
                    <span class="weather-temp">${temp}°C</span>
                    <span class="material-symbols-rounded weather-icon">cloud</span>
                `;
            }
        } catch (e) {
            console.error('Weather fetch failed:', e);
            widget.innerHTML = '<span class="weather-error" title="Weather failed: ' + e.message + '">!</span>';
        }
    }

    openSettings() {
        const container = document.getElementById('modal-container');
        container.innerHTML = SettingsModal(settings.settings);

        const close = () => { container.innerHTML = ''; };
        document.getElementById('close-settings').addEventListener('click', close);
        document.getElementById('settings-backdrop').addEventListener('click', (e) => {
            if (e.target.id === 'settings-backdrop') close();
        });

        // Event Bindings
        const bindCheckbox = (id, key) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', (e) => settings.set(key, e.target.checked));
        };
        const bindSelect = (id, key) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', (e) => settings.set(key, e.target.value));
        };
        const bindInput = (id, key) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', (e) => settings.set(key, e.target.value));
        };

        bindSelect('setting-theme', 'theme');
        bindCheckbox('setting-openNewTab', 'openNewTab');
        bindCheckbox('setting-animations', 'animations');
        bindCheckbox('setting-blur', 'blur');
        bindCheckbox('setting-disableDragDrop', 'disableDragDrop');
        bindCheckbox('setting-searchEnabled', 'searchEnabled');

        const dragDelayEl = document.getElementById('setting-dragDelay');
        if (dragDelayEl) {
            dragDelayEl.addEventListener('change', (e) => {
                settings.set('dragDelay', e.target.checked ? 400 : 0);
            });
        }

        bindInput('setting-accent', 'accentColor');
        bindInput('setting-wallpaper', 'wallpaper');
        bindInput('setting-appTitle', 'appTitle');
        bindInput('setting-greeting', 'greeting');
        bindInput('setting-search', 'searchProvider');
        bindCheckbox('setting-weatherEnabled', 'weatherEnabled');
        bindInput('setting-weatherLocation', 'weatherLocation');

        // Actions
        document.getElementById('btn-reset').addEventListener('click', () => {
            if (confirm('Reset all settings to default?')) {
                settings.reset();
                close();
            }
        });

        document.getElementById('btn-export').addEventListener('click', () => {
            const configObj = {
                settings: settings.settings,
                services: services.getAll() // Export current services state
            };

            const jsonStr = JSON.stringify(configObj, null, 2);
            const dataStr = "data:application/json;charset=utf-8," + encodeURIComponent(jsonStr);
            const anchor = document.createElement('a');
            anchor.setAttribute("href", dataStr);
            anchor.setAttribute("download", "config.json");
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
        });

        document.getElementById('btn-import').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const content = ev.target.result;
                        let data = null;
                        try {
                            data = JSON.parse(content);
                        } catch (err) {
                            console.error(err);
                            alert('Failed to parse file: ' + err.message);
                            return;
                        }

                        if (data && data.settings) {
                            // Import Settings
                            Object.keys(settings.settings).forEach(k => {
                                if (data.settings[k] !== undefined) settings.set(k, data.settings[k]);
                            });
                        }
                        if (data && data.services) {
                            services.replaceAll(data.services);
                        }
                        alert('Configuration imported.');
                        close();
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        });
    }

    applySettings(s) {
        // Theme
        if (s.theme === 'system') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
        } else {
            document.body.setAttribute('data-theme', s.theme);
        }

        // Custom Variables
        if (s.accentColor) {
            document.documentElement.style.setProperty('--primary-color', s.accentColor);
        }

        if (s.wallpaper) {
            console.log('Applying wallpaper:', s.wallpaper);
            document.body.style.backgroundImage = `url('${s.wallpaper}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
        } else {
            console.log('No wallpaper set, removing.');
            document.body.style.backgroundImage = '';
        }

        // Blur Effect
        if (!s.blur) document.body.classList.add('no-blur');
        else document.body.classList.remove('no-blur');

        // Animations
        if (!s.animations) document.body.classList.add('no-animations');
        else document.body.classList.remove('no-animations');

        // Layout (Grid vs List)
        const grid = document.getElementById('grid');
        if (grid) {
            if (s.layout === 'list') grid.classList.add('list-view');
            else grid.classList.remove('list-view');
        }

        // Re-render header to update title/search visibility
        const oldHeader = document.querySelector('header');
        if (oldHeader) {
            const temp = document.createElement('div');
            temp.innerHTML = Header(s);
            oldHeader.replaceWith(temp.firstElementChild);
        }

        this.updateHeaderText(s);

        // Re-init weather if visibility changed
        this.initWeather();
    }
}

export const ui = new UI();
