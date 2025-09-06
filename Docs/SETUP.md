# Setup Guide

## Prerequisites

- Node.js v16 or later
- npm or yarn
- MySQL 8.0+
- MongoDB 4.4+
- Redis 6.0+
- Mailgun account (for email notifications)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ahmed-e-elhor/Global-Expansion-Management-.git
   cd global-expansion-management
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration.

## Configuration


### Database Setup

1. Create a new MySQL database
2. Update the database configuration in `.env`:
   ```env
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=your_username
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=global_expansion
   ```

3. Run database migrations:
   ```bash
   npm run typeorm migration:run
   ```


### Local Machine Setup

### Docker Setup

1. Create a `docker-compose.yml` file in the root directory
2. Update the database configuration in `.env`:
   ```env
   MYSQL_HOST=mysql-db
   MYSQL_PORT=3306
   MYSQL_USER=your_username
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=global_expansion

   MONGO_URI=mongodb://mongo-db:27017/myappdb
   ```

### Email Configuration

1. Set up a Mailgun account
2. Update the email configuration in `.env`:
   ```env
   MAILGUN_API_KEY=your_mailgun_api_key
   MAILGUN_DOMAIN=your_mailgun_domain
   MAIL_FROM_EMAIL=noreply@yourdomain.com
   MAIL_FROM_NAME="Global Expansion"
   ```

### Redis Configuration

1. Install and run Redis server
2. Update Redis configuration in `.env`:
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

The application will be available at `http://localhost:3000` by default.
