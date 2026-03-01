#!/bin/bash
# ============================================
# Toolsy - Oracle Cloud Server Setup Script
# Run this on a fresh Ubuntu VM (22.04 or 24.04)
# Usage: chmod +x setup_server.sh && sudo ./setup_server.sh
# ============================================

set -e

echo "=========================================="
echo "  TOOLSY SERVER SETUP - Oracle Cloud"
echo "=========================================="

# 1. Update system
echo "[1/6] Updating system packages..."
apt-get update && apt-get upgrade -y

# 2. Install Docker
echo "[2/6] Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose plugin
apt-get install -y docker-compose-plugin

# Add current user to docker group
usermod -aG docker ubuntu 2>/dev/null || true

# 3. Install Git
echo "[3/6] Installing Git..."
apt-get install -y git

# 4. Open firewall ports
echo "[4/6] Configuring firewall..."
# iptables rules for Oracle Cloud (their security lists also need to be updated in the console)
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8000 -j ACCEPT
netfilter-persistent save 2>/dev/null || iptables-save > /etc/iptables/rules.v4

# 5. Clone the repo
echo "[5/6] Cloning Toolsy repository..."
cd /home/ubuntu
if [ ! -d "Toolsy" ]; then
    git clone https://github.com/sabithh/Toolsy.git
fi
cd Toolsy

# 6. Create swap space (helpful for small VMs)
echo "[6/6] Creating swap space..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo ""
echo "=========================================="
echo "  SETUP COMPLETE!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. cd /home/ubuntu/Toolsy"
echo "  2. Edit backend/.env.production with your values"
echo "     - Change SECRET_KEY to a random string"
echo "     - Change DB_PASSWORD to a strong password"
echo "     - Add your server IP to ALLOWED_HOSTS"
echo "     - Add your frontend URL to CORS_ALLOWED_ORIGINS"
echo "  3. Run: docker compose up -d --build"
echo "  4. Run migrations: docker compose exec backend python manage.py migrate"
echo "  5. Create superuser: docker compose exec backend python manage.py createsuperuser"
echo ""
echo "Your API will be available at http://YOUR_SERVER_IP"
echo "=========================================="
