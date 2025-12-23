export const Header = (settings) => `
    <header class="app-header">
        <div class="brand">
            <h1 class="logo">${settings.appTitle || 'Dashlet'}</h1>
            <div class="greeting">${settings.greeting || 'Lightweight dashboard for small apps'}</div>
        </div>
        
        <div class="controls">
            <button class="icon-btn" id="btn-layout" title="Toggle Layout">
                <span class="material-symbols-rounded">${settings.layout === 'list' ? 'grid_view' : 'view_list'}</span>
            </button>
            <button class="icon-btn" id="btn-settings" title="Settings">
                <span class="material-symbols-rounded">settings</span>
            </button>
        </div>
    </header>
`;
