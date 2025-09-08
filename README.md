# Global Expansion Management Platform

[![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

## Overview

A comprehensive platform for managing global vendor relationships, projects, and compliance documentation. The system enables businesses to efficiently manage their expansion into new markets by connecting them with qualified vendors and tracking project documentation.

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- MongoDB (v5.0 or higher)
- Redis (for background jobs)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ahmed-e-elhor/Global-Expansion-Management-.git
   cd Global-Expansion-Management-
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following environment variables:
   ```env
   # MySQL Database
   MYSQL_HOST=localhost
   MYSQL_PORT=3307
   MYSQL_USERNAME=root
   MYSQL_PASSWORD=1234
   MYSQL_DATABASE=mysql_expanderdb
   
   # MongoDB
   MONGO_URI=mongodb://localhost:27017/expansion_docs
   
   # JWT
   JWT_SECRET=your-secret-key
   
   # Mailgun (for notifications)
   MAILGUN_API_KEY=your-mailgun-key
   MAILGUN_DOMAIN=your-domain.com
   
   # Redis (for background jobs)
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

3. **Database Setup**

   **For Development (using synchronize):**
   ```bash
   # Set NODE_ENV=development in your .env file
   NODE_ENV=development
   
   # Start the application (tables will be auto-created)
   npm run start:dev
   
   # Seed initial data (countries and services)
   npm run seed
   ```

   **For Production (using migrations):**
   ```bash
   # Set NODE_ENV=production in your .env file
   NODE_ENV=production
   
   # Run database migrations to create tables
   npm run migration:run
   
   # Verify migration status
   npm run migration:show
   
   # Seed initial data (countries and services)
   npm run seed
   ```

4. **Run the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

## 🗄️ Database Migrations

This project uses TypeORM migrations for production database management 

### Migration Commands

```bash
# Show current migration status
npm run migration:show

# Run pending migrations
npm run migration:run

# Generate new migration (after entity changes)
npm run migration:generate src/migrations/MigrationName

# Revert last migration (if needed)
npm run migration:revert
```

### Initial Migration Setup

The project includes a comprehensive initial migration (`1725785320000-InitialMigration.ts`) that creates:

- **7 Main Tables**: users, countries, services, clients, vendors, projects, vendor_matches
- **3 Junction Tables**: vendor_countries, vendor_services, project_services  
- **All Relationships**: Foreign keys, indexes, and constraints
- **Enums**: User roles (client, admin, analyst), project status, vendor status

### Production Deployment

1. **Set Environment**
   ```bash
   NODE_ENV=production
   ```

2. **Run Initial Migration**
   ```bash
   npm run migration:run
   ```

3. **Verify Setup**
   ```bash
   npm run migration:show
   # Should show: [X] InitialMigration1725785320000
   ```

4. **Start Application**
   ```bash
   npm run start:prod
   # Migrations will auto-run on future deployments
   ```

### Future Schema Changes

When you modify entities and need to update the database schema:

1. **Make Entity Changes** in development with `NODE_ENV=development`

2. **Generate Migration**
   ```bash
   npm run migration:generate src/migrations/AddNewFeature
   ```

3. **Review Generated SQL** - Always check the migration file before applying

4. **Test Migration**
   ```bash
   npm run migration:run
   npm run migration:show
   ```

5. **Deploy to Production**
   ```bash
   # Commit migration file to version control
   git add src/migrations/
   git commit -m "Add new feature migration"
   
   # Deploy and run migration
   npm run migration:run
   ```

### Important Migration Notes

- **Never use `synchronize: true` in production**
- **Always review generated migrations before applying**
- **Test migrations on staging environment first**
- **Migrations are irreversible in production - plan carefully**
- **Keep all migration files in version control**

### 🐳 Docker Development Setup

For local development with hot reload using Docker:

1. **Prerequisites**
   ```bash
   # Make sure Docker and Docker Compose are installed
   docker --version
   docker-compose --version
   ```

2. **Environment Setup**
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Edit .env with your configuration
   # Required variables:
   # MYSQL_USER=your_mysql_user
   # MYSQL_PASSWORD=your_mysql_password
   # MYSQL_DATABASE=your_database_name
   # JWT_SECRET=your_jwt_secret
   # JWT_EXPIRATION=24h
   # MONGO_URI=mongodb://mongo-db:27017/myappdb
   ```

3. **Start Development Environment**
   ```bash
   # Build and start all services (NestJS app + MySQL + MongoDB)
   docker-compose up --build
   
   # Or run in detached mode
   docker-compose up -d --build
   ```

4. **Hot Reload Features**
   - The setup uses **nodemon** for automatic restart on file changes
   - Volume mounting enables real-time code synchronization
   - Debug port `9229` is exposed for debugging
   - Polling is enabled for file watching in Docker environment

5. **Available Services**
   - **NestJS App**: http://localhost:3000
   - **MySQL Database**: localhost:3307
   - **MongoDB**: localhost:27017
   - **Debug Port**: localhost:9229

6. **Development Commands**
   ```bash
   # View logs
   docker-compose logs -f nest-app
   
   # Execute commands in container
   docker-compose exec nest-app npm run seed
   
   # Stop services
   docker-compose down
   
   # Stop and remove volumes
   docker-compose down -v
   ```

7. **Database Seeding in Docker**
   ```bash
   # Seed the database after containers are running
   docker-compose exec nest-app npm run seed
   ``` 

## 📊 Database Schema

### Entity Relationship Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Users    │    │   Clients   │    │  Projects   │
│─────────────│    │─────────────│    │─────────────│
│ id (UUID)   │    │ id (UUID)   │    │ id (UUID)   │
│ email       │◄──►│ company_name│◄──►│ budget      │
│ password    │    │ user_id     │    │ status      │
│ role        │    └─────────────┘    │ client_id   │
│ createdAt   │                       │ country_id  │
│ updatedAt   │                       │ createdAt   │
└─────────────┘                       │ updatedAt   │
                                      └─────────────┘
                                             │
                                             ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Countries  │    │  Services   │    │VendorMatches│
│─────────────│    │─────────────│    │─────────────│
│ id (UUID)   │◄──►│ id (UUID)   │    │ id (UUID)   │
│ code (3chr) │    │ name        │◄──►│ project_id  │
│ name        │    │ description │    │ vendor_id   │
└─────────────┘    │ createdAt   │    │ score       │
                   │ updatedAt   │    │ isAccepted  │
                   └─────────────┘    │ createdAt   │
                          │           │ updatedAt   │
                          ▼           └─────────────┘
┌─────────────┐    ┌─────────────┐           │
│   Vendors   │    │ Documents   │           │
│─────────────│    │─────────────│           │
│ id (UUID)   │◄──►│ id ObjectId │◄──────────┘
│ name        │    │ title       │
│ rating      │    │ content     │
│ status      │    │ projectId   │
│ slaHours    │    │ tags        │
│ createdAt   │    │ createdAt   │
│ updatedAt   │    │ updatedAt   │
└─────────────┘    └─────────────┘
```

### Key Relationships

- **Users** → **Clients**: One-to-One (each client has one user account)
- **Clients** → **Projects**: One-to-Many (clients can have multiple projects)
- **Projects** → **Countries**: Many-to-One (projects target specific countries)
- **Projects** → **Services**: Many-to-Many (projects can require multiple services)
- **Projects** → **VendorMatches**: One-to-Many (projects get matched with multiple vendors)
- **Vendors** → **Countries**: Many-to-Many (vendors support multiple countries)
- **Vendors** → **Services**: Many-to-Many (vendors provide multiple services)
- **Projects** → **Documents**: One-to-Many (stored in MongoDB, linked by projectId)

## 🔧 API Endpoints

### Authentication
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "client"
}

Response: {
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "client"
  }
}
```

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: {
  "access_token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "client"
  }
}
```

### Countries
```http
GET /countries
Authorization: Bearer jwt-token

Response: [
  {
    "id": "uuid",
    "code": "UK",
    "name": "United Kingdom"
  }
]
```

```http
POST /countries
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "code": "FR",
  "name": "France"
}

Response: {
  "id": "uuid",
  "code": "FR",
  "name": "France"
}
```

### Services
```http
GET /services
Authorization: Bearer jwt-token

Response: [
  {
    "id": "uuid",
    "name": "Legal Consultation",
    "description": "Legal advisory services for business setup"
  }
]
```

```http
POST /services
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "name": "Tax Advisory",
  "description": "Tax planning and compliance services"
}
```

### Projects
```http
GET /projects
Authorization: Bearer jwt-token

Response: [
  {
    "id": "uuid",
    "budget": 50000.00,
    "status": "active",
    "country": {
      "code": "UK",
      "name": "United Kingdom"
    },
    "services": [
      {
        "name": "Legal Consultation"
      }
    ]
  }
]
```

```http
POST /projects
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "budget": 75000.00,
  "countryId": "country-uuid",
  "serviceIds": ["service-uuid-1", "service-uuid-2"]
}
```

```http
POST /projects/:id/matches/rebuild
Authorization: Bearer jwt-token

Response: {
  "projectId": "uuid",
  "matches": [
    {
      "id": "match-uuid",
      "vendorId": "vendor-uuid",
      "score": 8.75,
      "isAccepted": false
    }
  ],
  "matchesCount": 5
}
```

### Vendors
```http
GET /vendors
Authorization: Bearer jwt-token

Response: [
  {
    "id": "uuid",
    "name": "Global Legal Services",
    "rating": 4.5,
    "status": "ACTIVE",
    "responseSlaHours": 24
  }
]
```

```http
POST /vendors
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "name": "New Vendor Ltd",
  "rating": 4.0,
  "responseSlaHours": 48,
  "countryIds": ["country-uuid"],
  "serviceIds": ["service-uuid"]
}
```

### Documents
```http
GET /documents?projectId=uuid
Authorization: Bearer jwt-token

Response: [
  {
    "_id": "mongodb-objectid",
    "title": "Legal Requirements Document",
    "content": "Document content...",
    "projectId": "project-uuid",
    "tags": ["legal", "compliance"]
  }
]
```

```http
POST /documents
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "title": "Market Analysis Report",
  "content": "Detailed market analysis...",
  "projectId": "project-uuid",
  "tags": ["market", "research"]
}
```

```http
GET /documents/search?q=legal&projectId=uuid
Authorization: Bearer jwt-token

Response: [
  {
    "_id": "mongodb-objectid",
    "title": "Legal Requirements Document",
    "content": "Document content...",
    "score": 0.95
  }
]
```

### Analytics
```http
GET /analytics/top-vendors
Authorization: Bearer jwt-token

Response: [
  {
    "countryCode": "UK",
    "vendors": [
      {
        "id": "vendor-uuid-1",
        "name": "Top Vendor A"
      },
      {
        "id": "vendor-uuid-2", 
        "name": "Top Vendor B"
      }
    ],
    "documentCount": 15
  }
]
```

### Users
```http
GET /users/profile
Authorization: Bearer jwt-token

Response: {
  "id": "uuid",
  "email": "user@example.com",
  "role": "client"
}
```

```http
GET /users/admin
Authorization: Bearer jwt-token

Response: {
  "message": "This is an admin-only route"
}
```

## 🧮 Vendor Matching Formula

The system uses a sophisticated scoring algorithm to match vendors with projects:

### Scoring Components

1. **Services Overlap (60% weight)**
   - Counts matching services between project requirements and vendor capabilities
   - Higher overlap = better match

2. **Vendor Rating (30% weight)**
   - Uses vendor's historical performance rating (0-5 scale)
   - Higher rating = better match

3. **SLA Weight (10% weight)**
   - Based on vendor's response time commitment
   - Formula: `(168 - responseSlaHours) / 16.8`
   - Faster response = higher weight

### Final Score Calculation

```typescript
score = (servicesOverlap * 0.6) + (vendorRating * 0.3) + (slaWeight * 0.1)
```

### Matching Process

1. **Filter Vendors**: Only vendors supporting the project's target country
2. **Calculate Overlap**: Count matching services between project and vendor
3. **Compute Scores**: Apply the weighted formula above
4. **Rank Results**: Sort by score (highest first)
5. **Store Matches**: Save top matches to database for client review

### Example Calculation

For a project requiring 3 services in the UK:
- **Vendor A**: 3 matching services, 4.5 rating, 24h SLA
  - Services: 3 * 0.6 = 1.8
  - Rating: 4.5 * 0.3 = 1.35  
  - SLA: ((168-24)/16.8) * 0.1 = 0.86
  - **Total Score: 4.01**

- **Vendor B**: 2 matching services, 5.0 rating, 48h SLA
  - Services: 2 * 0.6 = 1.2
  - Rating: 5.0 * 0.3 = 1.5
  - SLA: ((168-48)/16.8) * 0.1 = 0.71
  - **Total Score: 3.41**

Vendor A would rank higher despite lower rating due to better service overlap.

## 🎯 Features

- **Multi-tenant Architecture**: Separate client workspaces
- **Hybrid Database**: MySQL for relational data, MongoDB for documents
- **Intelligent Matching**: Automated vendor-project matching with scoring
- **Document Management**: Full-text search and tagging
- **Analytics Dashboard**: Performance insights and reporting
- **Email Notifications**: Automated alerts and updates
- **Role-based Access**: Admin, Analyst, and Client permissions
- **RESTful API**: Complete API with authentication

## 🔒 Security

- JWT-based authentication
- Role-based authorization
- Input validation and sanitization
- SQL injection prevention
- Password hashing with bcrypt

## 📝 License

This project is [MIT licensed](LICENSE).
