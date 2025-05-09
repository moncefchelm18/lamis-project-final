# E-Constantine Résidence API Documentation

This document provides comprehensive documentation for the E-Constantine Résidence API endpoints.

## Base URL

```
http://localhost:5000
```

## Authentication

Most endpoints require authentication using JWT (JSON Web Token). Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

### Authentication Endpoints

#### Register User
- **URL**: `/api/auth/register`
- **Method**: POST
- **Auth**: Not Required
- **Request Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "role": "string",
    "studentId": "string"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    },
    "token": "string"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid input data
  - `409 Conflict`: Email already exists

#### Login
- **URL**: `/api/auth/login`
- **Method**: POST
- **Auth**: Not Required
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    },
    "token": "string"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid credentials
  - `404 Not Found`: User not found

## User Management

### Get All Users (Admin Only)
- **URL**: `/api/users`
- **Method**: GET
- **Auth**: Required (Admin)
- **Response (200 OK)**:
  ```json
  {
    "users": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "role": "string"
      }
    ]
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid token
  - `403 Forbidden`: Insufficient permissions

### Update User Profile
- **URL**: `/api/users/profile`
- **Method**: PUT
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string" (optional)
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid input data
  - `401 Unauthorized`: Missing or invalid token
  - `409 Conflict`: Email already exists

## Resident Management

### Add New Resident
- **URL**: `/api/residents`
- **Method**: POST
- **Auth**: Required (Admin or Service)
- **Request Body**:
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "roomNumber": "string",
    "checkInDate": "string (ISO 8601)",
    "checkOutDate": "string (ISO 8601)"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "resident": {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string",
      "roomNumber": "string",
      "checkInDate": "string",
      "checkOutDate": "string",
      "status": "string"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid input data
  - `401 Unauthorized`: Missing or invalid token
  - `403 Forbidden`: Insufficient permissions
  - `409 Conflict`: Room already occupied

### Delete Resident
- **URL**: `/api/residents/:id`
- **Method**: DELETE
- **Auth**: Required (Admin or Service)
- **URL Parameters**: `id` - Resident ID
- **Response (200 OK)**:
  ```json
  {
    "message": "Resident deleted successfully"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid token
  - `403 Forbidden`: Insufficient permissions
  - `404 Not Found`: Resident not found

### Update Resident
- **URL**: `/api/residents/:id`
- **Method**: PUT
- **Auth**: Required (Admin or Service)
- **URL Parameters**: `id` - Resident ID
- **Request Body**:
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "roomNumber": "string",
    "checkInDate": "string (ISO 8601)",
    "checkOutDate": "string (ISO 8601)",
    "status": "string"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "resident": {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string",
      "roomNumber": "string",
      "checkInDate": "string",
      "checkOutDate": "string",
      "status": "string"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid input data
  - `401 Unauthorized`: Missing or invalid token
  - `403 Forbidden`: Insufficient permissions
  - `404 Not Found`: Resident not found
  - `409 Conflict`: Room already occupied

### Search Residents
- **URL**: `/api/residents`
- **Method**: GET
- **Auth**: Required (Admin or Service)
- **Query Parameters**:
  - `name`: string (optional)
  - `email`: string (optional)
  - `roomNumber`: string (optional)
  - `status`: string (optional)
  - `page`: number (optional, default: 1)
  - `limit`: number (optional, default: 10)
- **Response (200 OK)**:
  ```json
  {
    "residents": [
      {
        "id": "string",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "phone": "string",
        "roomNumber": "string",
        "checkInDate": "string",
        "checkOutDate": "string",
        "status": "string"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "limit": "number",
      "pages": "number"
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid token
  - `403 Forbidden`: Insufficient permissions

## Accommodation Management

### Create Accommodation
- **URL**: `/api/accommodations`
- **Method**: POST
- **Auth**: Required (Service or Admin)
- **Request Body**:
  ```json
  {
    "roomNumber": "string",
    "type": "string",
    "floor": "number",
    "capacity": "number",
    "price": "number",
    "amenities": ["string"]
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "accommodation": {
      "id": "string",
      "roomNumber": "string",
      "type": "string",
      "floor": "number",
      "capacity": "number",
      "price": "number",
      "amenities": ["string"],
      "status": "string"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid input data
  - `401 Unauthorized`: Missing or invalid token
  - `403 Forbidden`: Insufficient permissions
  - `409 Conflict`: Room number already exists

### Approve Accommodation
- **URL**: `/api/accommodations/:id/approve`
- **Method**: PUT
- **Auth**: Required (Admin)
- **URL Parameters**: `id` - Accommodation ID
- **Response (200 OK)**:
  ```json
  {
    "accommodation": {
      "id": "string",
      "status": "approved"
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid token
  - `403 Forbidden`: Insufficient permissions
  - `404 Not Found`: Accommodation not found

### Reject Accommodation
- **URL**: `/api/accommodations/:id/reject`
- **Method**: PUT
- **Auth**: Required (Admin)
- **URL Parameters**: `id` - Accommodation ID
- **Request Body**:
  ```json
  {
    "reason": "string"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "accommodation": {
      "id": "string",
      "status": "rejected",
      "rejectionReason": "string"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing rejection reason
  - `401 Unauthorized`: Missing or invalid token
  - `403 Forbidden`: Insufficient permissions
  - `404 Not Found`: Accommodation not found

### List Accommodations
- **URL**: `/api/accommodations`
- **Method**: GET
- **Auth**: Not Required
- **Query Parameters**:
  - `type`: string (optional)
  - `floor`: number (optional)
  - `minPrice`: number (optional)
  - `maxPrice`: number (optional)
  - `capacity`: number (optional)
  - `status`: string (optional)
  - `page`: number (optional, default: 1)
  - `limit`: number (optional, default: 10)
- **Response (200 OK)**:
  ```json
  {
    "accommodations": [
      {
        "id": "string",
        "roomNumber": "string",
        "type": "string",
        "floor": "number",
        "capacity": "number",
        "price": "number",
        "amenities": ["string"],
        "status": "string"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "limit": "number",
      "pages": "number"
    }
  }
  ```

### Get Accommodation by ID
- **URL**: `/api/accommodations/:id`
- **Method**: GET
- **Auth**: Not Required
- **URL Parameters**: `id` - Accommodation ID
- **Response (200 OK)**:
  ```json
  {
    "accommodation": {
      "id": "string",
      "roomNumber": "string",
      "type": "string",
      "floor": "number",
      "capacity": "number",
      "price": "number",
      "amenities": ["string"],
      "status": "string"
    }
  }
  ```
- **Error Responses**:
  - `404 Not Found`: Accommodation not found

## Admin Settings

### Get Settings
- **URL**: `/api/admin/settings`
- **Method**: GET
- **Auth**: Required (Admin)
- **Response (200 OK)**:
  ```json
  {
    "settings": {
      "maintenanceMode": "boolean",
      "maxResidentsPerRoom": "number",
      "checkInTime": "string",
      "checkOutTime": "string",
      "supportEmail": "string",
      "supportPhone": "string"
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid token
  - `403 Forbidden`: Insufficient permissions

### Update Settings
- **URL**: `/api/admin/settings`
- **Method**: PUT
- **Auth**: Required (Admin)
- **Request Body**:
  ```json
  {
    "maintenanceMode": "boolean",
    "maxResidentsPerRoom": "number",
    "checkInTime": "string",
    "checkOutTime": "string",
    "supportEmail": "string",
    "supportPhone": "string"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "settings": {
      "maintenanceMode": "boolean",
      "maxResidentsPerRoom": "number",
      "checkInTime": "string",
      "checkOutTime": "string",
      "supportEmail": "string",
      "supportPhone": "string"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid input data
  - `401 Unauthorized`: Missing or invalid token
  - `403 Forbidden`: Insufficient permissions

## Health Endpoints

### Basic Application Information
- **URL**: `/`
- **Method**: GET
- **Auth**: Not Required
- **Response (200 OK)**:
  ```json
  {
    "status": "string",
    "version": "string",
    "uptime": "string"
  }
  ```

### System Context Information
- **URL**: `/context`
- **Method**: GET
- **Auth**: Required (Admin)
- **Response (200 OK)**:
  ```json
  {
    "system": {
      "version": "string",
      "environment": "string",
      "nodeVersion": "string",
      "memoryUsage": "object",
      "uptime": "string"
    },
    "database": {
      "status": "string",
      "version": "string",
      "connections": "number"
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid token
  - `403 Forbidden`: Insufficient permissions

## Error Responses

The API uses conventional HTTP response codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Server Error

Error response format:
```json
{
  "message": "Error description",
  "error": "Detailed error message",
  "code": "string" (optional)
}
```

## Role-Based Access

- **Admin**: Full access to all endpoints
- **Service**: Access to resident and accommodation management
- **User**: Access to profile management and public endpoints