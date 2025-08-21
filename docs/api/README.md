# 📡 API Reference

Welcome to the Event RSVP Manager API reference. This documentation provides detailed information about the available API endpoints, request/response formats, and authentication requirements.

## Base URL

All API endpoints are relative to the base URL:

```
https://api.yourdomain.com/v1
```

For local development:
```
http://localhost:3000/api
```

## Authentication

Most API endpoints require authentication. Include the JWT token in the `Authorization` header:

```http
Authorization: Bearer your-jwt-token
```

## Response Format

All API responses follow a standard format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    // Pagination info (if applicable)
  },
  "error": null
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {
      // Additional error details
    }
  }
}
```

## Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 204 | No Content - Success but no content to return |
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error - Server error |

## Rate Limiting

API requests are rate limited to prevent abuse:

- 60 requests per minute per IP address
- 1,000 requests per hour per authenticated user

## Available Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Invalidate token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Users
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user
- `GET /users/me/events` - Get user's events
- `GET /users/{id}` - Get user by ID (admin only)

### Events
- `GET /events` - List all events
- `POST /events` - Create new event
- `GET /events/{id}` - Get event details
- `PUT /events/{id}` - Update event
- `DELETE /events/{id}` - Delete event
- `GET /events/{id}/guests` - List event guests
- `POST /events/{id}/guests` - Add guest to event

### RSVPs
- `GET /rsvps` - List user's RSVPs
- `POST /rsvps` - Create RSVP
- `GET /rsvps/{id}` - Get RSVP details
- `PUT /rsvps/{id}` - Update RSVP
- `DELETE /rsvps/{id}` - Cancel RSVP

## Pagination

Endpoints that return lists support pagination using query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

Example:
```
GET /events?page=2&limit=20
```

Response includes pagination metadata:
```json
{
  "data": [],
  "meta": {
    "total": 100,
    "per_page": 20,
    "current_page": 2,
    "last_page": 5,
    "from": 21,
    "to": 40
  }
}
```

## Filtering and Sorting

Many list endpoints support filtering and sorting:

```
GET /events?status=upcoming&sort=-created_at&include=guests
```

### Common Filter Parameters
- `status` - Filter by status (e.g., `upcoming`, `past`, `draft`)
- `search` - Full-text search
- `from` - Filter by start date
- `to` - Filter by end date

### Sorting
- Prefix field with `-` for descending order (e.g., `-created_at`)
- Default sort is by creation date descending

## Error Handling

### Error Codes

| Code | Description |
|------|-------------|
| 1000 | Validation Error |
| 1001 | Authentication Failed |
| 1002 | Not Authorized |
| 1003 | Resource Not Found |
| 1004 | Rate Limit Exceeded |
| 2000 | Database Error |
| 2001 | External Service Error |
| 3000 | Unknown Error |

### Example Error Response

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "data": null,
  "error": {
    "code": 1000,
    "message": "Validation Failed",
    "details": {
      "email": ["The email field is required"],
      "password": ["The password must be at least 8 characters"]
    }
  }
}
```

## Webhooks

Coming soon...

## SDKs

Official SDKs are available for:

- JavaScript/TypeScript
- Python
- Ruby
- PHP

## Changelog

See [CHANGELOG.md](https://github.com/yourusername/event-rsvp/blob/main/CHANGELOG.md) for a list of changes between versions.

## Support

For support, please contact api-support@yourdomain.com.
