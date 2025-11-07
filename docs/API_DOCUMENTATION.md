# Authentication API Documentation

## Base URL
http://localhost:3000/api/v1

## Endpoints

### 1. Register Employee

**POST** `/auth/register`

Register a new employee account.

**Request Body:**
```json
{
  "employeeId": "EMP001",
  "name": "John Doe",
  "email": "john@company.com",
  "password": "password123",
  "department": "Engineering",      // Optional
  "position": "Developer",           // Optional
  "isAdmin": false,                  // Optional (default: false)
  "companyId": 1
}
```

**Success Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "employeeId": "EMP001",
    "name": "John Doe",
    "email": "john@company.com",
    "department": "Engineering",
    "position": "Developer",
    "isAdmin": false,
    "companyId": 1
  }
}
```

**Error Responses:**
- `409 Conflict` - Email or Employee ID already exists
- `400 Bad Request` - Company not found or validation error

---

### 2. Login

**POST** `/auth/login`

Authenticate an employee.

**Request Body:**
```json
{
  "email": "john@company.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "employeeId": "EMP001",
    "name": "John Doe",
    "email": "john@company.com",
    "department": "Engineering",
    "position": "Developer",
    "isAdmin": false,
    "companyId": 1
  }
}
```

**Error Response:**
- `401 Unauthorized` - Invalid credentials

---

### 3. Get Current User Profile

**GET** `/auth/me`

Get the authenticated user's profile.

**Headers:**
Authorization: Bearer <access_token>

**Success Response (200):**
```json
{
  "id": 1,
  "employeeId": "EMP001",
  "name": "John Doe",
  "email": "john@company.com",
  "department": "Engineering",
  "position": "Developer",
  "isAdmin": false,
  "companyId": 1,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "company": {
    "id": 1,
    "name": "GreenTech Solutions",
    "industry": "Technology"
  },
  "latestFootprint": null
}
```

**Error Response:**
- `401 Unauthorized` - Invalid or missing token

---

### 4. Test Protected Route

**GET** `/auth/test`

Test route to verify JWT authentication.

**Headers:**
Authorization: Bearer <access_token>

**Success Response (200):**
```json
{
  "message": "This is a protected route",
  "user": {
    "id": 1,
    "employeeId": "EMP001",
    "name": "John Doe",
    "email": "john@company.com",
    "department": "Engineering",
    "position": "Developer",
    "isAdmin": false,
    "companyId": 1,
    "company": {
      "id": 1,
      "name": "GreenTech Solutions",
      "industry": "Technology"
    }
  }
}
```

**Error Response:**
- `401 Unauthorized` - Invalid or missing token

---

## Authentication Flow

1. **Register** or **Login** to get an access token
2. Include the token in the `Authorization` header for protected routes:
Authorization: Bearer <your_token_here>
3. Token expires after 7 days (configurable in `.env`)

## Error Codes

- `200 OK` - Success
- `201 Created` - Resource created successfully
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Authentication failed
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error