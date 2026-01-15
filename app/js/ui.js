import { settings } from './store.js';
import { services } from './data.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { ServiceCard } from './components/ServiceCard.js';
import { SettingsModal } from './components/SettingsModal.js';
import { ContextMenu } from './components/ContextMenu.js';

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
            ${Footer(settings.settings)}
            <div id="modal-container"></div>
            ${ContextMenu()}
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
        this.initContextMenu();
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
        let allServices = services.getAll();
        const currentSettings = settings.settings;

        if (allServices.length === 0) {
            grid.innerHTML = '<div class="empty-state">No services added yet.</div>';
            return;
        }

        // Apply Sorting based on settings
        const sortBy = currentSettings.sortBy || 'manual';
        if (sortBy !== 'manual') {
            allServices = [...allServices].sort((a, b) => {
                const valA = (a[sortBy] || '').toLowerCase();
                const valB = (b[sortBy] || '').toLowerCase();
                return valA.localeCompare(valB);
            });
        }

        grid.innerHTML = allServices.map(s => ServiceCard(s, currentSettings)).join('');

        // Init/Re-init Sortable
        if (this.sortable) this.sortable.destroy();

        // Only enable Sortable if sortBy is manual AND D&D is not disabled
        if (sortBy !== 'manual' || currentSettings.disableDragDrop) return;

        this.sortable = new Sortable(grid, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            delay: currentSettings.dragDelay || 0,
            delayOnTouchOnly: true,
            onEnd: (evt) => {
                const ids = Array.from(grid.children).map(el => el.getAttribute('data-id'));
                const reordered = ids.map(id => services.getAll().find(s => s.id === id)).filter(Boolean);

                if (reordered.length === services.getAll().length) {
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

        // Delegate change event for sort select (since header might re-render)
        this.app.addEventListener('change', (e) => {
            if (e.target.id === 'select-sort') {
                settings.set('sortBy', e.target.value);
            }
        });

        // Search Input Listener
        this.app.addEventListener('keydown', (e) => {
            if (e.target.id === 'app-search' && e.key === 'Enter') {
                this.performSearch(e.target.value);
            }
        });

        // Context menu actions
        this.app.addEventListener('contextmenu', (e) => {
            const card = e.target.closest('.service-card');
            if (!card) return;
            e.preventDefault();
            const service = services.getAll().find(s => s.id === card.dataset.id);
            if (!service) return;
            this.showContextMenu(e.clientX, e.clientY, service);
        });

        // Long press for mobile context menu
        this.app.addEventListener('touchstart', (e) => {
            const card = e.target.closest('.service-card');
            if (!card) return;
            this.contextMenuTouchActive = false;
            this.contextMenuTouchTimer = window.setTimeout(() => {
                const touch = e.touches[0];
                const service = services.getAll().find(s => s.id === card.dataset.id);
                if (!service) return;
                this.contextMenuTouchActive = true;
                this.showContextMenu(touch.clientX, touch.clientY, service);
                if (navigator.vibrate) navigator.vibrate(40);
            }, 500);
        }, { passive: true });

        this.app.addEventListener('touchend', (e) => {
            if (this.contextMenuTouchTimer) {
                clearTimeout(this.contextMenuTouchTimer);
                this.contextMenuTouchTimer = null;
            }
            if (this.contextMenuTouchActive) {
                e.preventDefault();
                this.contextMenuTouchActive = false;
            }
        });

        this.app.addEventListener('touchmove', () => {
            if (this.contextMenuTouchTimer) {
                clearTimeout(this.contextMenuTouchTimer);
                this.contextMenuTouchTimer = null;
            }
        }, { passive: true });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#context-menu')) {
                this.hideContextMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideContextMenu();
            }
        });

        const main = document.getElementById('main-content');
        if (main) {
            main.addEventListener('scroll', () => this.hideContextMenu());
        }
    }

    initContextMenu() {
        this.contextMenuEl = document.getElementById('context-menu');
        this.contextMenuService = null;

        if (!this.contextMenuEl) return;

        this.contextMenuEl.addEventListener('click', (e) => {
            const item = e.target.closest('.context-menu-item');
            if (!item || !this.contextMenuService) return;
            const action = item.dataset.action;
            this.handleContextAction(action);
            this.hideContextMenu();
        });
    }

    showContextMenu(x, y, service) {
        if (!this.contextMenuEl) return;
        this.contextMenuService = service;
        this.contextMenuEl.classList.remove('hidden');
        this.contextMenuEl.setAttribute('aria-hidden', 'false');

        this.contextMenuEl.style.left = `${x}px`;
        this.contextMenuEl.style.top = `${y}px`;

        const rect = this.contextMenuEl.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            this.contextMenuEl.style.left = `${x - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            this.contextMenuEl.style.top = `${y - rect.height}px`;
        }
    }

    hideContextMenu() {
        if (!this.contextMenuEl) return;
        this.contextMenuEl.classList.add('hidden');
        this.contextMenuEl.setAttribute('aria-hidden', 'true');
        this.contextMenuService = null;
    }

    handleContextAction(action) {
        const service = this.contextMenuService;
        if (!service) return;

        switch (action) {
            case 'open':
                this.openService(service);
                break;
            case 'newTab':
                this.openService(service, true);
                break;
            case 'copy':
                this.copyServiceUrl(service);
                break;
            case 'share':
                this.shareService(service);
                break;
            case 'delete':
                this.deleteService(service);
                break;
        }
    }

    openService(service, forceNewTab = false) {
        if (!service) return;
        const target = forceNewTab ? '_blank' : (settings.get('openNewTab') ? '_blank' : '_self');
        window.open(service.url, target);
    }

    async copyServiceUrl(service) {
        if (!service) return;
        const url = service.url;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(url);
                return;
            }
        } catch (e) {
            console.warn('Clipboard API failed, falling back:', e);
        }

        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
    }

    async shareService(service) {
        if (!service) return;
        if (navigator.share) {
            try {
                await navigator.share({ title: service.name, url: service.url });
                return;
            } catch (e) {
                console.warn('Share canceled or failed:', e);
            }
        }
        this.copyServiceUrl(service);
    }

    deleteService(service) {
        if (!service) return;
        const confirmed = confirm(`Delete "${service.name}"?`);
        if (!confirmed) return;
        services.remove(service.id);
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

    openSettings() {
        const container = document.getElementById('modal-container');
        container.innerHTML = SettingsModal(settings.settings);

        const countEl = document.getElementById('settings-service-count');
        if (countEl) countEl.textContent = `${services.getAll().length} items`;

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
                            // Atomic replace
                            settings.replace(data.settings);
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

        // Re-render footer to update text/color
        const oldFooter = document.querySelector('footer');
        if (oldFooter) {
            const temp = document.createElement('div');
            temp.innerHTML = Footer(s);
            oldFooter.replaceWith(temp.firstElementChild);
        }

        this.updateHeaderText(s);
    }
}

export const ui = new UI();
