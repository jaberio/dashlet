# Dashlet

> Lightweight dashboard for small apps

Dashlet is a modern, self-hosted dashboard for your homelab services, focusing on a clean code, modular styling, and robust settings management.

## Features

- **Pure & Fast**: Built with Vanilla JS and SCSS. No heavy frameworks.
- **Glassmorphism UI**: Modern, sleek interface with dynamic animations.
- **Config Driven**: Load settings/services from `user/config.yaml`.
- **Customizable**:
    - **Themes**: System, Dark, Light, Custom Accent Colors.
    - **Backgrounds**: Set custom wallpaper URLs.
    - **Drag & Drop**: Reorder your services easily.
    - **Header/Footer**: Clean layout with fixed controls.
    - **Custom Files**: `user/custom.css` and `user/custom.js` support.

## Installation

### Local Development

1. Clone or download:
   ```bash
   git clone <repo> dashlet
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
   This will start a local server at `http://127.0.0.1:3000` and watch for SCSS changes.

### Deployment (Netlify/Vercel)

- **Build Command**: `npm run build`
- **Output Directory**: `.` (Current directory) or just serve `index.html`.

## Configuration

You can configure Dashlet via the UI or by editing `user/config.yaml`.
Export your current settings from the UI to generate a fresh config file.

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## License
This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.
