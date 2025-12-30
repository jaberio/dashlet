#!/bin/sh

# Check if config exists in the public directory; if not, create an empty one
if [ ! -f public/config.json ]; then
    echo "Config not found, creating empty default..."
    echo '{"settings": {}, "services": []}' > public/config.json
fi

# Start the application
exec npm start
