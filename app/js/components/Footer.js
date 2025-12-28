export const Footer = (settings) => {
    const text = (settings.footerText || 'Powered by').replace(/\s*Dashlet\s*$/i, '');
    return `
    <footer class="app-footer" ${settings.footerColor ? `style="color: ${settings.footerColor}"` : ''}>
        <div class="footer-content">
            <span class="footer-text">${text}</span>
            <a href="https://github.com/JaberQayad/dashlet" target="_blank" class="footer-link">Dashlet</a>
            <span class="footer-version">v1.0.0</span>
        </div>
    </footer>
`;
};
