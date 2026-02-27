#!/bin/bash
set -e

# ConformEdge — One-time server setup script
# Run this manually via SSH on the Hetzner server
# Usage: bash setup-server.sh

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

# --- Step 2: Clone repository ---
echo ""
echo "==> Step 2: Cloning repository..."
if [ -d "$APP_DIR" ]; then
    echo "Directory ${APP_DIR} already exists. Pulling latest..."
    cd "$APP_DIR"
    git pull origin main
else
    git clone https://github.com/isutech/conformedge.git "$APP_DIR"
    cd "$APP_DIR"
fi

# --- Step 3: Set up environment ---
echo ""
echo "==> Step 3: Setting up environment..."
if [ ! -f .env ]; then
    cp deployment/.env.production.example .env
    echo "Created .env from template. EDIT IT NOW with production values!"
    echo "  nano ${APP_DIR}/.env"
    echo ""
    read -p "Press Enter after editing .env to continue..."
else
    echo ".env already exists, skipping."
fi

# --- Step 4: Install dependencies and build ---
echo ""
echo "==> Step 4: Installing dependencies..."
npm ci --production=false

echo ""
echo "==> Step 5: Generating Prisma client..."
npx prisma generate

echo ""
echo "==> Step 6: Running database migrations..."
npx prisma migrate deploy

echo ""
echo "==> Step 7: Seeding database..."
npx prisma db seed

echo ""
echo "==> Step 8: Building application..."
npm run build

# Copy static assets to standalone output
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

# --- Step 5: Set up Nginx ---
echo ""
echo "==> Step 9: Setting up Nginx..."
sudo cp deployment/nginx/conformedge.conf /etc/nginx/sites-available/conformedge.conf
sudo ln -sf /etc/nginx/sites-available/conformedge.conf /etc/nginx/sites-enabled/conformedge.conf
sudo nginx -t && sudo systemctl reload nginx
echo "Nginx configured."

# --- Step 6: SSL certificate ---
echo ""
echo "==> Step 10: Setting up SSL certificate..."
sudo certbot --nginx -d "$DOMAIN"

# --- Step 7: Start PM2 ---
echo ""
echo "==> Step 11: Starting PM2 process..."
pm2 start ecosystem.config.cjs
pm2 save

# --- Step 8: Verify ---
echo ""
echo "==> Step 12: Verifying deployment..."
sleep 3
if curl -sf "http://127.0.0.1:3020" > /dev/null; then
    echo "Local health check passed!"
else
    echo "WARNING: Local health check failed. Check pm2 logs conformedge"
fi

echo ""
echo "============================================"
echo "  Setup complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Verify: curl -I https://${DOMAIN}"
echo "  2. Check PM2: pm2 status"
echo "  3. Check logs: pm2 logs conformedge --lines 20"
echo "  4. Add GitHub secrets for CI/CD:"
echo "     - HETZNER_HOST"
echo "     - HETZNER_USER"
echo "     - HETZNER_SSH_KEY"
echo ""
