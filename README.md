# 🌱 Corporate Carbon Tracker — Backend Setup (Week 2 Day 1)

This repository contains the **backend service** for the **Corporate Carbon Tracker** project.  
It connects the ML service (developed in Week 1) with a PostgreSQL database using **NestJS**, **Prisma**, and **Docker**.

---

## 🚀 Current Project Status

✅ **Completed**
- Week 1: Machine Learning model (Python FastAPI)
  - Model trained (R² ≈ 0.98)
  - Dataset processed (10,000 records)
  - Model artifacts stored in `/services/ml_service`
- Week 2 → Day 1: Backend environment setup
  - NestJS + Prisma + PostgreSQL integrated
  - Dockerized PostgreSQL running at `localhost:5433`
  - Prisma schema created & verified
  - Environment variables configured via `.env`
  - Base API working (health-check endpoint)

📅 **Next Steps**
- Day 2: Implement Authentication (JWT, bcrypt, guards)
- Day 3: CRUD APIs for employees, companies, and footprints
- Day 4: Integrate ML prediction service (`ML_SERVICE_URL`)
- Day 5: Leaderboard + Analytics + Testing + Documentation

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-------------|
| Backend Framework | [NestJS](https://nestjs.com/) |
| ORM | [Prisma](https://www.prisma.io/) |
| Database | PostgreSQL (v15, Dockerized) |
| Language | TypeScript (Node 18+) |
| ML Integration | Python FastAPI service |
| Deployment | Docker Compose (multi-service) |

---

## ⚙️ Project Structure

