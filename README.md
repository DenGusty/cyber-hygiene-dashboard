# Cyber Hygiene Dashboard for End-Users

A full-stack web application designed to assess and improve end-user cybersecurity behaviour through a behavioural risk model, personalised recommendations, and longitudinal tracking.

---

## Features

- User authentication (registration & login)
- Behaviour-based cybersecurity assessment
- Risk scoring across multiple dimensions
- Personalised security recommendations
- Dashboard visualisation (risk breakdown & radar chart)
- Assessment history tracking

---

## System Architecture

- Frontend: React (Vite + Axios)
- Backend: FastAPI (Python)
- Database: MySQL
- Deployment: Docker & Docker Compose

---

## Requirements

- Docker Desktop

---

## How to Run

1. Open terminal in project root  
2. Run:

```bash
docker compose up --build

3. Open frontend:
http://localhost

4.Backend API:
http://localhost:8000/docs