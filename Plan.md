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
