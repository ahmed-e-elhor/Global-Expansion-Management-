# Database Schema Overview

## Entity Relationship Diagram
```mermaid
erDiagram
    USERS {
        int id PK
        varchar(255) email
        varchar(255) role
    }
    
    CLIENTS {
        int id PK
        varchar(255) name
    }

    PROJECTS {
        int id PK
        varchar(255) name
        text requirements
        int userId FK
    }
    
    VENDORS {
        int id PK
        varchar(255) name
        varchar(255) industry
        json capabilities
    }
    
    USERS ||--o{ PROJECTS : manages
    PROJECTS ||--o{ VENDOR_MATCHES : generates
    VENDORS ||--o{ VENDOR_MATCHES : participates
```

## Tables Description
### Users Table
- Stores platform users and administrators
- Roles: ADMIN, MANAGER, VIEWER

### Clients Table
- Stores client information

### Projects Table
- Tracks client expansion projects
- Contains technical requirements and scoring criteria

### Vendors Table
- Maintains vendor profiles and capabilities
- Uses JSON field for dynamic attribute storage
