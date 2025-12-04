# Database Viewing Guide

## Quick Access Methods

### 1. API Endpoint (Real-time Stats)
Access the database statistics endpoint:
```
GET http://localhost:3000/api/v1/db-stats
```

This endpoint provides:
- Counts of companies, employees, and footprints
- Recent footprint calculations with employee details
- Database connection information

### 2. Direct PostgreSQL Connection

#### Using psql (Command Line)
```bash
# Connect to the database
psql -h localhost -p 5432 -U postgres -d carbon_tracker_dev

# Password: postgres123
```

#### Using Docker Exec
```bash
# Access the database container
docker exec -it carbon-tracker-db psql -U postgres -d carbon_tracker_dev
```

### 3. Using Database GUI Tools

#### pgAdmin
1. Download and install [pgAdmin](https://www.pgadmin.org/)
2. Create a new server connection:
   - Host: `localhost`
   - Port: `5432`
   - Database: `carbon_tracker_dev`
   - Username: `postgres`
   - Password: `postgres123`

#### DBeaver
1. Download and install [DBeaver](https://dbeaver.io/)
2. Create a new PostgreSQL connection with the same credentials above

#### TablePlus
1. Download and install [TablePlus](https://tableplus.com/)
2. Create a new PostgreSQL connection with the same credentials

### 4. Useful SQL Queries

```sql
-- View all companies
SELECT * FROM companies;

-- View all employees
SELECT id, employee_id, name, email, department, company_id FROM employees;

-- View all carbon footprints
SELECT 
  cf.id,
  e.name as employee_name,
  e.department,
  cf.total_footprint,
  cf.travel_footprint,
  cf.energy_footprint,
  cf.waste_footprint,
  cf.diet_footprint,
  cf.calculated_at
FROM carbon_footprints cf
JOIN employees e ON cf.employee_id = e.id
ORDER BY cf.calculated_at DESC;

-- View footprint statistics by employee
SELECT 
  e.name,
  e.department,
  COUNT(cf.id) as total_calculations,
  AVG(cf.total_footprint) as avg_footprint,
  MAX(cf.total_footprint) as max_footprint,
  MIN(cf.total_footprint) as min_footprint
FROM employees e
LEFT JOIN carbon_footprints cf ON e.id = cf.employee_id
GROUP BY e.id, e.name, e.department
ORDER BY avg_footprint DESC;

-- View recent footprints (last 24 hours)
SELECT 
  e.name,
  cf.total_footprint,
  cf.calculated_at
FROM carbon_footprints cf
JOIN employees e ON cf.employee_id = e.id
WHERE cf.calculated_at > NOW() - INTERVAL '24 hours'
ORDER BY cf.calculated_at DESC;
```

### 5. Real-time Monitoring

To see real-time database changes, you can:

1. **Use the API endpoint** in a polling loop:
```bash
watch -n 2 'curl -s http://localhost:3000/api/v1/db-stats | jq'
```

2. **Use psql with auto-refresh**:
```sql
-- In psql, run this query repeatedly
SELECT COUNT(*) as total_footprints FROM carbon_footprints;
```

3. **Set up a simple monitoring script**:
```bash
#!/bin/bash
while true; do
  clear
  echo "=== Database Stats ==="
  curl -s http://localhost:3000/api/v1/db-stats | jq '.counts'
  echo ""
  echo "=== Recent Footprints ==="
  curl -s http://localhost:3000/api/v1/db-stats | jq '.recentFootprints[0:5]'
  sleep 5
done
```

## Database Schema

### Main Tables

1. **companies** - Company information
2. **employees** - Employee accounts
3. **carbon_footprints** - Carbon footprint calculations

### Connection Details

- **Host**: localhost (or postgres container name in Docker)
- **Port**: 5432 (or 5433 for dev)
- **Database**: carbon_tracker_dev
- **Username**: postgres
- **Password**: postgres123

## Troubleshooting

If you can't connect:
1. Ensure the database container is running: `docker ps`
2. Check if the port is correct: `docker-compose.yml` shows port 5432
3. Verify credentials match the docker-compose.yml environment variables

