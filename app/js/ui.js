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
            // Re-render header to update title/greeting if changed
            const oldHeader = document.querySelector('header');
            if (oldHeader) {
                const temp = document.createElement('div');
                temp.innerHTML = Header(newSettings);
                oldHeader.replaceWith(temp.firstElementChild);
                // Need to re-bind listener? 
                // Yes, listeners attached to old header are gone.
                // Better approach: Update text content directly or delegate listener to #app.
            }
            this.updateHeaderText(newSettings);
        });

        // Initial Render
        this.renderServices();
        this.applySettings(settings.settings);
    }

    updateHeaderText(s) {
        const logo = document.querySelector('.logo');
        if (logo) logo.textContent = s.appTitle || 'Dashlet';
        const greet = document.querySelector('.greeting');
        if (greet) greet.textContent = s.greeting || 'Lightweight dashboard for small apps';

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
        this.sortable = new Sortable(grid, {
            animation: 150,
            ghostClass: 'sortable-ghost',
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

        bindInput('setting-accent', 'accentColor');
        bindInput('setting-wallpaper', 'wallpaper');
        // New Title/Greeting Inputs
        bindInput('setting-appTitle', 'appTitle');
        bindInput('setting-greeting', 'greeting');

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

            let yamlStr = '';
            if (window.jsyaml && window.jsyaml.dump) {
                yamlStr = window.jsyaml.dump(configObj);
            } else {
                yamlStr = JSON.stringify(configObj, null, 2);
            }

            const dataStr = "data:text/yaml;charset=utf-8," + encodeURIComponent(yamlStr);
            const anchor = document.createElement('a');
            anchor.setAttribute("href", dataStr);
            anchor.setAttribute("download", "config.yaml");
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
        });

        document.getElementById('btn-import').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,.yaml,.yml';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const content = ev.target.result;
                        // Try YAML first if avail
                        let data = null;
                        try {
                            if (window.jsyaml) {
                                data = window.jsyaml.load(content);
                            } else {
                                data = JSON.parse(content);
                            }
                        } catch (err) {
                            console.error(err);
                            alert('Failed to parse file');
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
            document.body.style.backgroundImage = `url('${s.wallpaper}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
        } else {
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
    }
}

export const ui = new UI();
