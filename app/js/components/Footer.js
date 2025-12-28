export const Footer = (settings) => `
    <footer class="app-footer" style="color: ${settings.footerColor || 'inherit'}">
        <div class="footer-content">
            <span>${settings.footerText || 'Powered by Dashlet'}</span>
        </div>
    </footer>
`;
