export const SettingsModal = (currentSettings) => `
    <div class="modal-backdrop" id="settings-backdrop">
        <div class="modal">
            <div class="modal-header">
                <h2>Settings</h2>
                <button class="close-btn" id="close-settings">
                    <span class="material-symbols-rounded">close</span>
                </button>
            </div>
            
            <div class="modal-body">
                <section>
                    <h3>Appearance</h3>
                    <div class="setting-row">
                        <label for="setting-appTitle">App Title</label>
                        <input type="text" id="setting-appTitle" value="${currentSettings.appTitle || 'Dashlet'}" placeholder="Dashlet">
                    </div>
                    <div class="setting-row">
                        <label for="setting-greeting">Greeting</label>
                        <input type="text" id="setting-greeting" value="${currentSettings.greeting || 'Lightweight dashboard for small apps'}" placeholder="Lightweight dashboard for small apps">
                    </div>
                    <div class="setting-row">
                        <label for="setting-theme">Theme</label>
                        <select id="setting-theme">
                            <option value="system" ${currentSettings.theme === 'system' ? 'selected' : ''}>System</option>
                            <option value="dark" ${currentSettings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                            <option value="light" ${currentSettings.theme === 'light' ? 'selected' : ''}>Light</option>
                        </select>
                    </div>
                    <div class="setting-row">
                        <label for="setting-accent">Accent Color</label>
                        <input type="color" id="setting-accent" value="${currentSettings.accentColor || '#3b82f6'}">
                    </div>
                    <div class="setting-row">
                        <label for="setting-wallpaper">Background URL</label>
                        <input type="text" id="setting-wallpaper" placeholder="https://..." value="${currentSettings.wallpaper || ''}">
                    </div>
                     <div class="setting-row">
                        <label class="checkbox-label">
                            <input type="checkbox" id="setting-blur" ${currentSettings.blur ? 'checked' : ''}>
                            <span>Glass Blur Effect</span>
                        </label>
                    </div>
                </section>

                <section>
                    <h3>Search</h3>
                    <div class="setting-row">
                        <label class="checkbox-label">
                            <input type="checkbox" id="setting-searchEnabled" ${currentSettings.searchEnabled ? 'checked' : ''}>
                            <span>Enable Search</span>
                        </label>
                    </div>
                    <div class="setting-row">
                        <label for="setting-search">Search Provider</label>
                        <input type="text" id="setting-search" placeholder="https://..." value="${currentSettings.searchProvider || ''}">
                    </div>
                    <small class="help-text">Query placeholder should be <code>%s</code> or at the end of the URL.</small>
                </section>

                <section>
                    <h3>Behavior</h3>
                    <div class="setting-row">
                        <label class="checkbox-label">
                            <input type="checkbox" id="setting-openNewTab" ${currentSettings.openNewTab ? 'checked' : ''}>
                            <span>Open links in new tab</span>
                        </label>
                    </div>
                    <div class="setting-row">
                        <label class="checkbox-label">
                            <input type="checkbox" id="setting-animations" ${currentSettings.animations ? 'checked' : ''}>
                            <span>Enable animations</span>
                        </label>
                    </div>
                    <div class="setting-row">
                        <label class="checkbox-label">
                            <input type="checkbox" id="setting-disableDragDrop" ${currentSettings.disableDragDrop ? 'checked' : ''}>
                            <span>Disable Drag & Drop</span>
                        </label>
                    </div>
                    <div class="setting-row">
                        <label class="checkbox-label">
                            <input type="checkbox" id="setting-dragDelay" ${currentSettings.dragDelay > 0 ? 'checked' : ''}>
                            <span>Mobile-Safe Drag (Long Press)</span>
                        </label>
                    </div>
                </section>

                <section>
                    <h3>Configuration</h3>
                     <div class="setting-row actions-row">
                        <button id="btn-export">Export Config</button>
                        <button id="btn-import">Import Config</button>
                    </div>
                    <div class="setting-row">
                         <small class="help-text">
                            <strong>Export:</strong> Download current settings as <code>config.json</code>.<br>
                            <strong>Import:</strong> Load settings/services from a JSON file into the current session. (Does not save to server).
                        </small>
                    </div>
                    <div class="setting-row" style="margin-top: 1rem;">
                        <button id="btn-reset" class="danger-btn">Reset to Defaults</button>
                    </div>
                </section>

                <div class="modal-footer-info">
                    <span class="dot"></span>
                    <span id="settings-service-count">0 items</span>
                </div>
            </div>
        </div>
    </div>
`;
