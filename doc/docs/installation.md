# Installation

Dashlet can be installed in several ways, depending on your environment.

## Docker (Recommended)

The easiest way to run Dashlet is using Docker.

### Using Docker Run

```bash
docker run -d \
  -p 8989:8989 \
  --name dashlet \
  --restart unless-stopped \
  -v /path/to/your/config:/app/public \
  ghcr.io/jaberio/dashlet:latest
```

### Using Docker Compose

Create a `docker-compose.yml` file:

```yaml
services:
  dashlet:
    image: ghcr.io/jaberio/dashlet:latest
    container_name: dashlet
    ports:
      - "8989:8989"
    volumes:
      - ./app/public:/app/public
    restart: unless-stopped
```

Run the container:

```bash
docker-compose up -d
```

## Local Development

If you want to contribute or build from source:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/jaberio/dashlet.git
   cd dashlet
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run the development server**:

   ```bash
   npm run dev
   ```

   This starts the development server at `http://localhost:8989` with live-reload and SCSS watching.

4. **Production Build**:
   ```bash
   npm start
   ```
   This serves the static files without development tools.

## Static Hosting (Netlify/Vercel)

Dashlet is a static application and can be hosted on any static site hosting provider.

- **Netlify**: Use the "Deploy to Netlify" button in the README.
- **Vercel**: Use the "Deploy to Vercel" button in the README.
- **Manual**: Upload the contents of the `app` directory to your hosting provider.
