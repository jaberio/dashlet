# Dashlet

> Lightweight dashboard for small apps
>
> **[Live Demo](https://jaberqayad.github.io/dashlet/)**

Dashlet is a modern, self-hosted dashboard for your homelab services, focusing on a clean code, modular styling, and robust settings management.

## Features

- **Pure & Fast**: Built with Vanilla JS and SCSS. No heavy frameworks.
- **Glassmorphism UI**: Modern, sleek interface with dynamic animations.
- **Config Driven**: Load settings/services from `public/config.json`.
- **Customizable**:
    - **Themes**: System, Dark, Light, Custom Accent Colors.
    - **Backgrounds**: Set custom wallpaper URLs.
    - **Drag & Drop**: Reorder your services easily.
    - **Header/Footer**: Clean layout with fixed controls.
    - **Custom Files**: `public/custom.css` and `public/custom.js` support.

## Installation

### Local Development

1. Clone or download:
   ```bash
   git clone https://github.com/JaberQayad/dashlet.git
   cd dashlet
   ```
2. Install dependencies (for SCSS compiler):
   ```bash
   npm install
   ```
3. Run dev mode (watch SCSS):
   ```bash
   npm run dev
   ```
   This will start a local server at `http://127.0.0.1:8989` and watch for SCSS changes.

### Deployment (Netlify/Vercel)

- [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/JaberQayad/dashlet) 

- [![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/git-source?repository=https://github.com/JaberQayad/dashlet)


### Docker Deployment

Run Dashlet instantly with Docker:

```bash
docker run -d -p 8989:8989 --name dashlet jaypel/dashlet:latest
```

Or using **Docker Compose**:

> [!TIP]
> **Data Persistence**: Mount the `/app/public` volume to persist your configuration (`config.json`) and custom assets.

```yaml
services:
  dashlet:
    image: jaypel/dashlet:latest
    container_name: dashlet
    ports:
      - "8989:8989"
    volumes:
      - ./app/public:/app/public
    restart: unless-stopped
```

## Configuration

You can configure Dashlet via the UI (Settings > Export Config) or by editing `public/config.json`.
Export your current settings from the UI to generate a fresh `config.json` file.

### Example `public/config.json`

```json
{
  "settings": {
        "theme": "system",
        "accentColor": "#3b82f6",
        "blur": true,
        "animations": true,
        "openNewTab": true,
        "layout": "grid",
        "wallpaper": "",
        "searchProvider": "https://duckduckgo.com/?q=",
        "weatherEnabled": false,
        "weatherLocation": "",
        "customCSS": ""
    },
  "services": [
    {
      "id": "1",
      "name": "GitHub",
      "description": "Code hosting",
      "url": "https://github.com",
      "icon": "https://github.githubassets.com/favicons/favicon.png"
    },
    {
      "id": "2",
      "name": "YouTube",
      "description": "Watch videos",
      "url": "https://youtube.com",
      "icon": "https://www.youtube.com/s/desktop/10c3d9b4/img/favicon_144x144.png"
    }
  ]
}
```

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## License
This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.
