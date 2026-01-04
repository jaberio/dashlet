# Configuration

Dashlet is primarily configured via a `config.json` file located in the `public` directory.

## Managing Config via UI

The easiest way to manage your configuration is directly through the Dashlet UI:

1. Click the **Settings** (gear) icon in the footer.
2. Adjust your settings or manage services.
3. Use the **Export Config** button to download your current configuration as a `config.json` file.
4. Replace your existing `public/config.json` with the downloaded file.

## Manual Configuration

You can also edit `public/config.json` manually.

### Schema

```json
{
  "settings": {
    "theme": "system", // system, light, dark
    "accentColor": "#3b82f6", // HEX color code
    "blur": true, // enable/disable glassmorphism blur
    "animations": true, // enable/disable animations
    "openNewTab": true, // open service links in a new tab
    "layout": "grid", // grid
    "wallpaper": "", // URL to custom background image
    "searchProvider": "https://duckduckgo.com/?q=",
    "sortBy": "manual", // name, manual, url, description
    "customCSS": "" // additional custom CSS
  },
  "services": [
    {
      "id": "1",
      "name": "GitHub",
      "description": "Code hosting",
      "url": "https://github.com",
      "icon": "https://github.githubassets.com/favicons/favicon.png"
    }
  ]
}
```

### Persistence

When using Docker, ensure you mount the `public` directory to a persistent volume to keep your configuration across container restarts.

```yaml
volumes:
  - ./my-data:/app/public
```

## Custom CSS and JS

For advanced customization beyond the built-in settings, you can add your own styles and logic:

- `public/custom.css`: Add any custom CSS rules here.
- `public/custom.js`: Add custom JavaScript behavior here.
