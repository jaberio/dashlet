# Adding a New Service

This guide will show you how to add a new service to your Dashlet dashboard.

## Using the UI (Recommended)

1. Open your Dashlet instance in the browser.
2. Click the **Plus (+)** icon or open **Settings > Manage Services**.
3. Fill in the service details:
   - **Name**: The name of the service (e.g., "Plex").
   - **URL**: The link to the service (e.g., "http://192.168.1.50:32400").
   - **Description**: A short description of what it is.
   - **Icon**: A URL to an icon.
4. Click **Save**.

## Using `config.json`

Add a new object to the `services` array in your `public/config.json`:

```json
{
  "id": "unique-id",
  "name": "My New Service",
  "description": "Explaining the service",
  "url": "https://example.com",
  "icon": "https://example.com/icon.png"
}
```

## Tips for Icons

- **Favicons**: Most services have a favicon at `service.com/favicon.ico`.
- **Dashboard Icons**: Use high-quality icons from projects like [WalkxIcon](https://github.com/walkxcode/dashboard-icons) for a more professional look.
- **Local SVGs**: You can place SVGs in the `public/icons` folder and reference them as `/icons/my-icon.svg`.
