# Leaderboard & Analytics API Documentation

## Base URL
http://localhost:3000/api/v1/leaderboard

---

## Employee Leaderboard

### Get Employee Leaderboard

**GET** `/employees`

Get ranked list of employees by carbon footprint (lower is better).

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)
- `month` (optional): Target month (1-12)
- `year` (optional): Target year
- `department` (optional): Filter by department

**Example:**
```
GET /api/v1/leaderboard/employees?limit=20&month=11&year=2024
```

**Response:**
```json
[
  {
    "rank": 1,
    "employeeId": "EMP001",
    "name": "John Doe",
    "department": "Engineering",
    "totalFootprint": 850,
    "treesNeeded": 2,
    "calculationCount": 1,
    "trend": "improving",
    "badge": "🥇 Champion"
  }
]
```

### Get My Rank

**GET** `/my-rank`

Get current user's rank in the leaderboard.

**Response:**
```json
{
  "rank": 5,
  "employeeId": "EMP001",
  "name": "John Doe",
  "department": "Engineering",
  "totalFootprint": 1200,
  "treesNeeded": 3,
  "calculationCount": 1,
  "trend": "stable",
  "badge": "⭐ Outstanding",
  "totalParticipants": 50
}
```

---

## Department Rankings

### Get Department Rankings

**GET** `/departments`

Get ranked list of departments by average carbon footprint.

**Query Parameters:**
- `month` (optional): Target month
- `year` (optional): Target year

**Response:**
```json
[
  {
    "rank": 1,
    "department": "Engineering",
    "employeeCount": 15,
    "averageFootprint": 950,
    "totalFootprint": 14250,
    "treesNeeded": 35,
    "topPerformer": {
      "name": "John Doe",
      "footprint": 750
    }
  }
]
```

---

## Achievements

### Get Employee Achievements

**GET** `/achievements/:employeeId`

Get list of achievements earned by an employee.

**Response:**
```json
[
  {
    "id": "first_calculation",
    "name": "Getting Started",
    "description": "Completed your first carbon footprint calculation",
    "icon": "🌱",
    "earnedAt": "2024-11-01T10:00:00.000Z"
  },
  {
    "id": "low_footprint",
    "name": "Eco Warrior",
    "description": "Maintained footprint under 1000 kg CO2",
    "icon": "🌍",
    "earnedAt": "2024-11-15T10:00:00.000Z"
  }
]
```

**Available Achievements:**
- 🌱 **Getting Started**: First calculation
- 📊 **Consistent Tracker**: 5+ calculations
- 🌍 **Eco Warrior**: Footprint < 1000 kg
- 📉 **Trending Down**: 3 consecutive improvements
- ♻️ **Recycling Champion**: Recycling all materials
- 🚴 **Green Commuter**: Eco-friendly transport

---

## Trends & Analytics

### Get Monthly Trends

**GET** `/trends`

Get historical trend data showing changes over time.

**Query Parameters:**
- `months` (optional): Number of months to include (default: 6, max: 12)

**Response:**
```json
[
  {
    "month": 6,
    "year": 2024,
    "averageFootprint": 1250,
    "totalCalculations": 45,
    "change": -8,
    "changeDirection": "down"
  },
  {
    "month": 7,
    "year": 2024,
    "averageFootprint": 1150,
    "totalCalculations": 48,
    "change": -8,
    "changeDirection": "down"
  }
]
```

### Compare Performance

**GET** `/compare`

Compare employee performance with company/department averages.

**Query Parameters:**
- `department` (optional): Compare with department average
- `month` (optional): Target month
- `year` (optional): Target year

**Response:**
```json
{
  "employee": {
    "footprint": 950,
    "treesNeeded": 2
  },
  "companyAverage": 1200,
  "departmentAverage": 1100,
  "percentile": 25,
  "comparisonToAverage": -21,
  "status": "excellent"
}
```

**Status Values:**
- `excellent`: < 90% of company average
- `good`: < 100% of company average
- `average`: < 110% of company average
- `needs_improvement`: ≥ 110% of company average

---

## Company Rankings

### Get Company Rankings

**GET** `/companies`

Get ranked list of companies (for multi-company scenarios).

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)

**Response:**
```json
[
  {
    "rank": 1,
    "companyId": 1,
    "companyName": "GreenTech Solutions",
    "industry": "Technology",
    "employeeCount": 50,
    "averageFootprint": 1050,
    "totalFootprint": 52500
  }
]
```

---

## Badges & Recognition

### Badge System

Badges are automatically assigned based on performance:

| Badge | Criteria |
|-------|----------|
| 🥇 Champion | Rank 1 |
| 🥈 Runner-up | Rank 2 |
| 🥉 Third Place | Rank 3 |
| 🌟 Elite | Footprint < 500 kg |
| ⭐ Outstanding | Footprint < 1000 kg |
| 🏆 Top 10 | Rank ≤ 10 |

---

## Error Responses

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "No footprint data for this period"
}
```

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```