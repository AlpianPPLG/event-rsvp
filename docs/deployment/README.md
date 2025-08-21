# 🚀 Deployment Guide

This guide will walk you through deploying the Event RSVP Manager to production.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Server Requirements](#server-requirements)
- [Deployment Options](#deployment-options)
  - [Vercel](#vercel-recommended)
  - [AWS](#aws)
  - [Docker](#docker)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Scaling](#scaling)
- [Monitoring](#monitoring)
- [Backup and Recovery](#backup-and-recovery)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+ installed on your server
- npm or Yarn
- Git
- MySQL/PostgreSQL database
- Domain name (recommended)
- SSL certificate (recommended)

## Server Requirements

- **CPU**: 2+ cores
- **Memory**: 2GB+ RAM
- **Storage**: 10GB+ SSD
- **OS**: Ubuntu 20.04 LTS or later (recommended)

## Deployment Options

### Vercel (Recommended)

1. **Deploy to Vercel**
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fevent-rsvp)

2. **Configure Environment Variables**
   - Go to your project in Vercel
   - Navigate to Settings > Environment Variables
   - Add all variables from `.env.example`

3. **Configure Build Settings**
   ```
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Deploy**
   - Push to the `main` branch to trigger automatic deployment
   - Or manually deploy from the Vercel dashboard

### AWS

1. **Launch an EC2 Instance**
   - Select Ubuntu Server 20.04 LTS
   - t3.medium or larger instance type
   - Configure security groups to allow HTTP/HTTPS traffic

2. **Connect to Your Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Install Dependencies**
   ```bash
   # Update packages
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install -y nginx
   ```

4. **Deploy the Application**
   ```bash
   # Clone the repository
   git clone https://github.com/yourusername/event-rsvp.git
   cd event-rsvp
   
   # Install dependencies
   npm install --production
   
   # Build the application
   npm run build
   
   # Start the application with PM2
   pm2 start npm --name "event-rsvp" -- start
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/event-rsvp
   ```
   
   Add the following configuration:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
   
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/event-rsvp /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Docker

1. **Install Docker and Docker Compose**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - DATABASE_URL=mysql://user:password@db:3306/event_rsvp
         - NEXTAUTH_SECRET=your-secret
         - NEXTAUTH_URL=http://localhost:3000
       depends_on:
         - db
       restart: unless-stopped
     
     db:
       image: mysql:8.0
       environment:
         MYSQL_ROOT_PASSWORD: your-root-password
         MYSQL_DATABASE: event_rsvp
         MYSQL_USER: user
         MYSQL_PASSWORD: password
       volumes:
         - db_data:/var/lib/mysql
       restart: unless-stopped
   
   volumes:
     db_data:
   ```

3. **Build and Start**
   ```bash
   docker-compose up -d
   docker-compose exec app npx prisma migrate deploy
   ```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# App
NODE_ENV=production
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://yourdomain.com

# Database
DATABASE_URL="mysql://user:password@localhost:3306/event_rsvp"

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Email (optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
```

## Database Setup

### MySQL

```sql
CREATE DATABASE event_rsvp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'user'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON event_rsvp.* TO 'user'@'%';
FLUSH PRIVILEGES;
```

### Run Migrations

```bash
npx prisma migrate deploy
```

## SSL/TLS Configuration

### Let's Encrypt with Certbot

1. **Install Certbot**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. **Obtain Certificate**
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. **Auto-Renewal**
   ```bash
   sudo certbot renew --dry-run
   sudo systemctl enable certbot.timer
   ```

## Scaling

### Horizontal Scaling
- Use a load balancer (e.g., AWS ALB, Nginx)
- Configure sticky sessions if using in-memory sessions
- Use a shared session store (Redis)

### Database Scaling
- Set up read replicas
- Implement database connection pooling
- Use a managed database service (RDS, Aurora)

## Monitoring

### Application Monitoring
- **PM2**: `pm2 monit`
- **Logs**: `pm2 logs`
- **Metrics**: Prometheus + Grafana

### Error Tracking
- **Sentry**: For error tracking
- **LogRocket**: For session replay

## Backup and Recovery

### Database Backups

1. **Automated Backups**
   ```bash
   # Create a backup script
   echo "mysqldump -u user -p'password' event_rsvp > /backups/event_rsvp_$(date +%Y%m%d).sql" > /usr/local/bin/backup-db.sh
   chmod +x /usr/local/bin/backup-db.sh
   
   # Schedule daily backups
   (crontab -l 2>/dev/null; echo "0 0 * * * /usr/local/bin/backup-db.sh") | crontab -
   ```

2. **Restore from Backup**
   ```bash
   mysql -u user -p'password' event_rsvp < backup_file.sql
   ```

### File Backups
- Use AWS S3 or similar for file storage
- Enable versioning
- Set up lifecycle policies

## Troubleshooting

### Common Issues

#### Application Not Starting
- Check logs: `pm2 logs`
- Verify environment variables
- Check port availability

#### Database Connection Issues
- Verify database server is running
- Check credentials in `.env`
- Check network connectivity

#### Performance Issues
- Check server resources: `htop`
- Optimize database queries
- Enable caching

## Maintenance

### Updating the Application

```bash
# Pull the latest changes
git pull origin main

# Install new dependencies
npm install

# Run migrations
npx prisma migrate deploy

# Restart the application
pm2 restart event-rsvp
```

### Security Updates
- Regularly update dependencies: `npm audit fix`
- Keep the operating system updated
- Monitor security advisories

## Support

For additional help, please contact:
- Email: support@yourdomain.com
- GitHub Issues: [https://github.com/yourusername/event-rsvp/issues](https://github.com/yourusername/event-rsvp/issues)
