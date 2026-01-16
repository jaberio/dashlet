export const ContextMenu = () => `
    <div id="context-menu" class="context-menu hidden" role="menu" aria-hidden="true">
        <button class="context-menu-item" data-action="open" role="menuitem">
            <span class="material-symbols-rounded">open_in_browser</span>
            <span>Open</span>
        </button>
        <button class="context-menu-item" data-action="newTab" role="menuitem">
            <span class="material-symbols-rounded">open_in_new</span>
            <span>Open in New Tab</span>
        </button>
        <button class="context-menu-item" data-action="copy" role="menuitem">
            <span class="material-symbols-rounded">content_copy</span>
            <span>Copy URL</span>
        </button>
        <button class="context-menu-item" data-action="share" role="menuitem">
            <span class="material-symbols-rounded">share</span>
            <span>Share</span>
        </button>
    </div>
`;
