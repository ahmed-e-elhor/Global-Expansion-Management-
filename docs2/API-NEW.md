# Global Expansion API Reference (v2)

## Core Endpoints

### Vendors
`GET /api/vendors` - List all vendors  
`POST /api/vendors` - Create new vendor  
```json
// Request Body
{
  "name": "Tech Solutions Ltd",
  "industry": "IT Services",
  "capabilities": {
    "regions": ["EMEA", "APAC"],
    "certifications": ["ISO-9001"]
  }
}
```

### Projects
`GET /api/projects` - List active projects  
`POST /api/projects` - Create new project  
```json
// Request Body
{
  "name": "Asia Pacific Expansion",
  "requirements": {
    "targetRegions": ["APAC"],
    "requiredCertifications": ["ISO-27001"]
  }
}
```

### Matches
`GET /api/matches?projectId={id}` - Get vendor matches for project  
Response:
```json
{
  "projectId": 123,
  "matches": [
    {
      "vendorId": 456,
      "score": 92.5,
      "factors": {
        "regionMatch": 100,
        "certificationMatch": 85
      }
    }
  ]
}
```

## Authentication
```http
Authorization: Bearer <JWT_TOKEN>
X-API-Key: <CLIENT_KEY>
```

## Rate Limits
- 100 requests/minute
- 500 requests/day
