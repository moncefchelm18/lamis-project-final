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
- **Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: Returns user data and authentication token

#### Login
- **URL**: `/api/auth/login`
- **Method**: POST
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: Returns user data and authentication token

## User Management

### Get All Users (Admin Only)
- **URL**: `/api/users`
- **Method**: GET
- **Auth**: Required (Admin)
- **Response**: List of all users

### Update User Profile
- **URL**: `/api/users/profile`
- **Method**: PUT
- **Auth**: Required
- **Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string" (optional)
  }
  ```

## Resident Management

### Add New Resident
- **URL**: `/api/residents`
- **Method**: POST
- **Auth**: Required (Admin or Service)
- **Body**: Resident details

### Delete Resident
- **URL**: `/api/residents/:id`
- **Method**: DELETE
- **Auth**: Required (Admin or Service)

### Update Resident
- **URL**: `/api/residents/:id`
- **Method**: PUT
- **Auth**: Required (Admin or Service)
- **Body**: Updated resident details

### Search Residents
- **URL**: `/api/residents`
- **Method**: GET
- **Auth**: Required (Admin or Service)
- **Query Parameters**: Search criteria

## Accommodation Management

### Create Accommodation
- **URL**: `/api/accommodations`
- **Method**: POST
- **Auth**: Required (Service or Admin)
- **Body**: Accommodation details

### Approve Accommodation
- **URL**: `/api/accommodations/:id/approve`
- **Method**: PUT
- **Auth**: Required (Admin)

### Reject Accommodation
- **URL**: `/api/accommodations/:id/reject`
- **Method**: PUT
- **Auth**: Required (Admin)

### List Accommodations
- **URL**: `/api/accommodations`
- **Method**: GET
- **Auth**: Not Required

### Get Accommodation by ID
- **URL**: `/api/accommodations/:id`
- **Method**: GET
- **Auth**: Not Required

## Admin Settings

### Get Settings
- **URL**: `/api/admin/settings`
- **Method**: GET
- **Auth**: Required (Admin)

### Update Settings
- **URL**: `/api/admin/settings`
- **Method**: PUT
- **Auth**: Required (Admin)
- **Body**: Updated settings

## Health Endpoints

### Basic Application Information
- **URL**: `/`
- **Method**: GET
- **Auth**: Not Required

### System Context Information
- **URL**: `/context`
- **Method**: GET
- **Auth**: Required (Admin)

## Error Responses

The API uses conventional HTTP response codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

Error response format:
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Role-Based Access

- **Admin**: Full access to all endpoints
- **Service**: Access to resident and accommodation management
- **User**: Access to profile management and public endpoints