#  Reference

## Base URL
All  endpoints are prefixed with `/`.

## Authentication

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "access_token": "jwt.token.here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "admin"
  }
}
```

## Users

### Get Current User
```http
GET /users/me
```

### Get All Users (Admin only)
```http
GET /users
```

## Vendors

### Get All Vendors
```http
GET /vendors
```

### Get Vendor by ID
```http
GET /vendors/:id
```

### Create Vendor
```http
POST /vendors
```

**Request Body:**
```json
{
  "name": "Vendor Name",
  "industry": "Technology",
  "country": "United States",
  "contactEmail": "vendor@example.com",
  "contactPhone": "+1234567890"
}
```

## Projects

### Get All Projects
```http
GET /projects
```

### Get Project by ID
```http
GET /projects/:id
```

### Create Project
```http
POST /projects
```

**Request Body:**
```json
{
  "name": "Project Name",
  "description": "Project description",
  "clientId": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### Get Project Matches
```http
GET /projects/:id/matches
```

## Documents

### Upload Document
```http
POST /documents/upload
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: The document file
- `vendorId`: ID of the vendor
- `type`: Document type (e.g., 'certificate', 'contract')
- `expiryDate`: Expiration date (YYYY-MM-DD)

## Analytics

### Get Dashboard Stats
```http
GET /analytics/dashboard
```

**Response:**
```json
{
  "totalVendors": 42,
  "activeProjects": 15,
  "expiringDocuments": 5,
  "matchRate": 0.85
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["error message"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```
