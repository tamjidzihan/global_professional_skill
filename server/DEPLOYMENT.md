# Deployment Guide

## Production Deployment Checklist

### 1. Pre-Deployment

- [ ] Set `DEBUG=False` in production
- [ ] Configure strong `SECRET_KEY`
- [ ] Set up production database (PostgreSQL)
- [ ] Configure Redis for Celery
- [ ] Set up email service (SMTP/SES)
- [ ] Configure allowed hosts
- [ ] Set up SSL certificates
- [ ] Configure static/media file storage (S3 recommended)

### 2. Environment Variables

Create a `.env` file with:

```env
DEBUG=False
SECRET_KEY=<generate-strong-secret-key>
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:password@host:5432/dbname
REDIS_URL=redis://redis:6379/0

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# AWS S3 (Optional but recommended)
USE_S3=True
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name

# Sentry (Optional but recommended)
SENTRY_DSN=your-sentry-dsn

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

### 3. Docker Deployment

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Create superuser
docker-compose exec web python manage.py createsuperuser

# View logs
docker-compose logs -f web
```

### 4. Manual Server Deployment (Ubuntu)

#### Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and PostgreSQL
sudo apt install python3.11 python3.11-venv python3-pip postgresql postgresql-contrib nginx redis-server -y

# Install system dependencies
sudo apt install build-essential libpq-dev python3-dev -y
```

#### Create Database

```bash
sudo -u postgres psql
CREATE DATABASE learning_platform;
CREATE USER platformuser WITH PASSWORD 'strongpassword';
ALTER ROLE platformuser SET client_encoding TO 'utf8';
ALTER ROLE platformuser SET default_transaction_isolation TO 'read committed';
ALTER ROLE platformuser SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE learning_platform TO platformuser;
\q
```

#### Setup Application

```bash
# Clone repository
git clone <your-repo-url>
cd learning_platform

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env  # Edit with production values

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Create superuser
python manage.py createsuperuser
```

#### Setup Gunicorn

Create `/etc/systemd/system/learning_platform.service`:

```ini
[Unit]
Description=Learning Platform Gunicorn daemon
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/path/to/learning_platform
Environment="PATH=/path/to/learning_platform/venv/bin"
ExecStart=/path/to/learning_platform/venv/bin/gunicorn \
          --workers 4 \
          --bind unix:/path/to/learning_platform/gunicorn.sock \
          config.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl start learning_platform
sudo systemctl enable learning_platform
```

#### Setup Celery

Create `/etc/systemd/system/celery.service`:

```ini
[Unit]
Description=Celery Service
After=network.target

[Service]
Type=forking
User=ubuntu
Group=www-data
WorkingDirectory=/path/to/learning_platform
Environment="PATH=/path/to/learning_platform/venv/bin"
ExecStart=/path/to/learning_platform/venv/bin/celery -A config worker -l info --detach

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl start celery
sudo systemctl enable celery
```

#### Setup Nginx

Create `/etc/nginx/sites-available/learning_platform`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        alias /path/to/learning_platform/staticfiles/;
    }
    
    location /media/ {
        alias /path/to/learning_platform/media/;
    }

    location / {
        proxy_pass http://unix:/path/to/learning_platform/gunicorn.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/learning_platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 5. AWS Deployment (EC2 + RDS + S3)

#### Create RDS PostgreSQL Instance
1. Go to AWS RDS Console
2. Create PostgreSQL database
3. Note down endpoint and credentials

#### Create S3 Bucket
1. Go to AWS S3 Console
2. Create bucket for media files
3. Configure CORS policy
4. Note bucket name and region

#### Launch EC2 Instance
1. Ubuntu 22.04 LTS
2. t2.medium or larger
3. Configure security groups (80, 443, 22)
4. Follow manual deployment steps above

#### Environment Variables

```env
DATABASE_URL=postgresql://user:password@rds-endpoint:5432/dbname
USE_S3=True
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_STORAGE_BUCKET_NAME=your-bucket
AWS_S3_REGION_NAME=us-east-1
```

### 6. Kubernetes Deployment

See `k8s/` directory for Kubernetes manifests.

### 7. Monitoring & Logging

#### Sentry Integration

Add to `.env`:
```env
SENTRY_DSN=your-sentry-dsn
```

#### CloudWatch Logs (AWS)

Install awslogs agent and configure for application logs.

### 8. Backup Strategy

#### Database Backups

```bash
# Automated daily backups
0 2 * * * /usr/bin/pg_dump learning_platform > /backups/db_$(date +\%Y\%m\%d).sql
```

#### Media Files Backups

Use S3 versioning and cross-region replication.

### 9. Performance Optimization

- Enable database connection pooling
- Configure Redis caching
- Use CDN for static files
- Enable Gzip compression in Nginx
- Optimize database queries
- Set up database read replicas

### 10. Security Hardening

- Keep all packages updated
- Configure firewall (UFW)
- Disable root SSH login
- Use SSH keys only
- Enable fail2ban
- Regular security audits
- Monitor logs for suspicious activity

### 11. Post-Deployment

- [ ] Test all API endpoints
- [ ] Verify email sending
- [ ] Test user registration flow
- [ ] Test course creation and approval
- [ ] Monitor application logs
- [ ] Set up monitoring alerts
- [ ] Document deployment configuration

## Troubleshooting

### Common Issues

**Database Connection Errors**
- Check DATABASE_URL format
- Verify database credentials
- Ensure PostgreSQL is running

**Static Files Not Loading**
- Run `python manage.py collectstatic`
- Check STATIC_ROOT configuration
- Verify Nginx static file configuration

**Celery Not Processing Tasks**
- Check Redis connection
- Verify Celery service is running
- Check Celery logs

**Email Not Sending**
- Verify EMAIL_HOST_USER and EMAIL_HOST_PASSWORD
- Check email provider settings
- Test SMTP connection

## Maintenance

### Regular Tasks

- Monitor disk space
- Review application logs
- Update dependencies
- Backup database
- Monitor performance metrics
- Review security logs

### Scaling

- Add more Gunicorn workers
- Set up database read replicas
- Use Redis cluster
- Implement caching strategy
- Use load balancer
- Consider microservices architecture

## Support

For deployment issues:
- Check logs: `docker-compose logs` or `/var/log/`
- Review documentation
- Contact DevOps team
