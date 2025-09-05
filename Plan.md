## Task

Business Context:
Expanders360 helps founders run expansion projects in new countries. Each project requires structured data (clients, vendors, projects) stored in MySQL, and unstructured research documents (e.g., market insights, contracts, reports) stored in MongoDB. Your mission is to design a backend that connects these worlds and powers the matching of projects with vendors.

🛠️ Your Tasks
Auth & Roles

Implement JWT authentication in NestJS

Roles: client, admin

Clients can manage their own projects

Admins can manage vendors and system configs

Projects & Vendors (MySQL) - Relational schema in MySQL:

clients (id, company_name, contact_email)

projects (id, client_id, country, services_needed[], budget, status)

vendors (id, name, countries_supported[], services_offered[], rating, response_sla_hours)

matches (id, project_id, vendor_id, score, created_at)


Research Documents (MongoDB)

Store market reports and project research files in MongoDB (schema-free).

Each document is linked to a project (projectId).

Provide an endpoint to:

Upload a document (title, content, tags).

Query/search documents by tag, text, or project.

Project-Vendor Matching

Build an endpoint /projects/:id/matches/rebuild that generates vendor matches using MySQL queries.

Matching rules:

Vendors must cover same country

At least one service overlap

Score formula: services_overlap * 2 + rating + SLA_weight

Store matches in DB with idempotent upsert logic.


Analytics & Cross-DB Query

Create an endpoint /analytics/top-vendors that returns:

Top 3 vendors per country (avg match score last 30 days, from MySQL)

Count of research documents linked to expansion projects in that country (from MongoDB)

This requires joining relational and non-relational sources in your service layer.


Notifications & Scheduling

When a new match is generated → send email notification (SMTP or mock service).

Implement a scheduled job (e.g., using NestJS Schedule or BullMQ) that:

Refreshes matches daily for “active” projects

Flags vendors with expired SLAs

Deployment

Dockerized app with MySQL + MongoDB containers

Deploy to any free cloud (Render, Railway, AWS free tier, etc.)

Provide a working .env.example and setup instructions

🧰 Tech Stack
NestJS (TypeScript)

MySQL for relational data

MongoDB for unstructured documents

JWT Authentication

ORM: TypeORM (MySQL) + Mongoose (MongoDB)

Scheduling: NestJS Schedule / BullMQ

Docker + docker-compose


## Plan

### Phase 1: Setup & Project Initialization (Estimated: 4–6 hrs)

Tasks:

Set up project skeleton (NestJS, TypeScript)

nest new global-expansion-api

Configure linting, prettier, basic folder structure

Install dependencies

@nestjs/typeorm, mysql2, @nestjs/mongoose, mongoose, @nestjs/jwt, passport-jwt, @nestjs/schedule, bullmq

Configure .env and configuration module

Add DB connection configs for MySQL and MongoDB

Create .env.example

Set up Docker for local development

Create docker-compose.yml with MySQL + MongoDB + Adminer/Mongo Express

Push initial commit to GitHub

### Phase 2: Authentication & Roles (Estimated: 6–8 hrs)

Tasks:

Implement JWT Authentication

Create AuthModule with register/login endpoints

Use bcrypt for password hashing

Define User entity and roles (client, admin) in MySQL

Implement Role-based access control (RBAC)

Use NestJS RolesGuard

Create decorators @Roles('admin')

Test login/role protection with Postman

### Phase 3: Database Design & Setup (Estimated: 8–10 hrs)

Tasks:

Design MySQL schemas:

clients, projects, vendors, matches

Define relationships & indexes

Generate migrations & seeders with TypeORM

Set up MongoDB schema for research documents

Mongoose model: { projectId, title, content, tags, createdAt }

Write DB connection test cases

### Phase 4: Core API Endpoints (CRUD) (Estimated: 10–12 hrs)

Tasks:

CRUD for Clients, Projects, Vendors

CRUD for Research Documents (MongoDB)

Upload document

Search by tag, text, or projectId

Apply validation with class-validator

Protect endpoints with roles (client vs admin)

### Phase 5: Matching Logic & Endpoint (Estimated: 6–8 hrs)

Tasks:

Create endpoint: GET /projects/:id/matches/rebuild

Implement matching rules:

Country must match

At least one service overlap

Score formula: (overlap * 2) + rating + SLA_weight

Store matches in MySQL (idempotent upsert)

Write unit tests for matching logic

### Phase 6: Analytics & Cross-DB Query (Estimated: 6–8 hrs)

Tasks:

Endpoint: GET /analytics/top-vendors

Fetch top 3 vendors per country (MySQL)

Count research docs per project (MongoDB)

Merge relational + non-relational data in service layer

Optimize queries for performance

### Phase 7: Notifications & Scheduling (Estimated: 4–6 hrs)

Tasks:

Email notification on new match

Use Nodemailer or mock SMTP (e.g., Mailtrap)

Scheduled job (NestJS Schedule or BullMQ)

Refresh matches daily for active projects

Flag vendors with expired SLAs

### Phase 8: Deployment & Finalization (Estimated: 6–10 hrs)

Tasks:

Dockerize the app for production

Multi-stage Dockerfile

docker-compose with MySQL + MongoDB

Deploy to Render / Railway / AWS Free Tier

Prepare .env.example for deployment

Test deployment with API calls

### Phase 9: Documentation & Video Demo (Estimated: 6 hrs)

Tasks:

README.md

Setup instructions

Schema diagrams

API docs (Swagger or Postman collection)

Matching formula

Record demo video (5–8 mins):

DB schemas

API calls

Analytics

Deployment link

Total Estimated Time

56 – 64 hours (7–8 full workdays or 10–12 part-time days)

Suggested Timeline (if you have ~2 weeks)

Day 1–2 → Phase 1 & 2

Day 3–4 → Phase 3

Day 5–6 → Phase 4

Day 7 → Phase 5

Day 8 → Phase 6

Day 9 → Phase 7

Day 10–11 → Phase 8

Day 12 → Phase 9