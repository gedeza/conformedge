#!/bin/bash
set -e

# ConformEdge — One-time server setup script
# Run manually via SSH on the Hetzner server
# Usage: bash deployment/setup-server.sh

APP_DIR="/var/www/conformedge"
DOMAIN="conformedge.isutech.co.za"
DB_NAME="conformedge"
DB_USER="conformedge_user"

echo "============================================"
echo "  ConformEdge — Server Setup"
echo "============================================"

# --- Step 1: Create PostgreSQL database and user ---
echo ""
echo "==> Step 1: Setting up PostgreSQL..."
read -sp "Enter password for database user '${DB_USER}': " DB_PASS
echo ""

sudo -u postgres psql <<EOF
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
EOF

echo "Database '${DB_NAME}' and user '${DB_USER}' created."

# --- Step 2: Set up environment ---
echo ""
echo "==> Step 2: Setting up environment..."
if [ ! -f .env ]; then
    cp deployment/.env.production.example .env
    # Set the DB password automatically
    sed -i "s/CHANGE_ME/${DB_PASS}/g" .env
    echo "Created .env from template."
    echo "EDIT IT NOW with production keys (Clerk, Anthropic, Resend, AWS):"
    echo "  nano ${APP_DIR}/.env"
    echo ""
    read -p "Press Enter after editing .env to continue..."
else
    echo ".env already exists, skipping."
fi

# --- Step 3: Install dependencies and build ---
echo ""
echo "==> Step 3: Installing dependencies..."
npm ci --production=false

echo ""
echo "==> Step 4: Generating Prisma client..."
npx prisma generate

echo ""
echo "==> Step 5: Running database migrations..."
npx prisma migrate deploy

echo ""
echo "==> Step 6: Seeding database..."
npx prisma db seed

echo ""
echo "==> Step 7: Building application..."
npm run build

# --- Step 4: Set up Nginx ---
echo ""
echo "==> Step 8: Setting up Nginx..."
sudo cp deployment/nginx/conformedge.conf /etc/nginx/sites-available/conformedge
sudo ln -sf /etc/nginx/sites-available/conformedge /etc/nginx/sites-enabled/conformedge
sudo nginx -t && sudo systemctl reload nginx
echo "Nginx configured."

# --- Step 5: SSL certificate ---
echo ""
echo "==> Step 9: Setting up SSL certificate..."
sudo certbot --nginx -d "$DOMAIN"

# --- Step 6: Start PM2 ---
echo ""
echo "==> Step 10: Starting PM2 process..."
pm2 start ecosystem.config.cjs
pm2 save

# --- Step 7: Verify ---
echo ""
echo "==> Step 11: Verifying deployment..."
sleep 3
if curl -sf "http://127.0.0.1:3020" > /dev/null; then
    echo "Local health check passed!"
else
    echo "WARNING: Local health check failed. Check: pm2 logs conformedge"
fi

echo ""
echo "============================================"
echo "  Setup complete!"
echo "============================================"
echo ""
echo "Verify:"
echo "  curl -I https://${DOMAIN}"
echo "  pm2 status"
echo "  pm2 logs conformedge --lines 20"
echo ""
