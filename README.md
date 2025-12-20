# 🎯 Job Portal - Microservices Application

A full-stack Job Search System built with **Spring Boot Microservices** and **React**. Features include job posting, applications management, favorites, real-time status updates, and email notifications.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-green)
![React](https://img.shields.io/badge/React-18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Contributing](#-contributing)

## ✨ Features

### For Job Seekers
- 🔍 Search and filter jobs by location, type, experience level
- 📝 Apply for jobs with cover letter and resume
- ❤️ Save favorite jobs
- 📊 Track application status (Pending → Reviewed → Shortlisted → Interview → Accepted/Rejected)
- 📧 Email notifications on status changes

### For Employers
- 📮 Post new job listings
- ✏️ Edit and manage job postings
- 🔄 Activate/Deactivate jobs (soft delete)
- 👥 View and manage applications
- 📋 Update application status with email notifications
- 📈 Dashboard with statistics

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│                         Port: 3000                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (Spring Cloud)                │
│                         Port: 8080                           │
│              - JWT Authentication Filter                     │
│              - Request Routing                               │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ Auth Service│   │ Job Service │   │ Application │
│  Port: 8081 │   │  Port: 8082 │   │   Service   │
│             │   │             │   │  Port: 8083 │
│ - Register  │   │ - CRUD Jobs │   │ - Apply     │
│ - Login     │   │ - Search    │   │ - Status    │
│ - JWT       │   │ - Favorites │   │ - Email     │
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘
       │                 │                 │
       └────────────────┬┴─────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │   PostgreSQL    │
              │   job_portal    │
              └─────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │  Eureka Server  │
              │   Port: 8761    │
              │ Service Registry│
              └─────────────────┘
```

## 🛠 Tech Stack

### Backend
- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Cloud 2023.0.0**
- **Spring Cloud Gateway** - API Gateway
- **Spring Cloud Netflix Eureka** - Service Discovery
- **Spring Data JPA** - Database ORM
- **Spring Mail** - Email notifications
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Lombok** - Boilerplate reduction

### Frontend
- **React 18**
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **React Icons** - Icons

## 📦 Prerequisites

- **Java 17** or higher
- **Node.js 18** or higher
- **Maven 3.8** or higher
- **PostgreSQL 15** or higher

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/job-portal.git
cd job-portal
```

### 2. Set up PostgreSQL Database

```sql
CREATE DATABASE job_portal;
```

### 3. Configure Backend Services

Copy example configuration files and update with your credentials:

```bash
# For each service, copy the example file
cp eureka-server/src/main/resources/application.example.yml eureka-server/src/main/resources/application.yml
cp api-gateway/src/main/resources/application.example.yml api-gateway/src/main/resources/application.yml
cp auth-service/src/main/resources/application.example.yml auth-service/src/main/resources/application.yml
cp job-service/src/main/resources/application.example.yml job-service/src/main/resources/application.yml
cp application-service/src/main/resources/application.example.yml application-service/src/main/resources/application.yml
```

Update the following in each `application.yml`:
- Database credentials (`username`, `password`)
- JWT secret key (use a strong 256-bit key)
- Email credentials (for application-service)

### 4. Configure Frontend

```bash
cd frontend
cp .env.example .env
npm install
```

## ⚙️ Configuration

### Database Configuration
Update in `auth-service`, `job-service`, and `application-service`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/job_portal
    username: your_username
    password: your_password
```

### JWT Secret
Update in `auth-service` and `api-gateway` (must be the same):

```yaml
jwt:
  secret: your-256-bit-secret-key-minimum-32-characters-long
```

### Email Configuration (Optional)
Update in `application-service` for email notifications:

```yaml
spring:
  mail:
    username: your-email@gmail.com
    password: your-gmail-app-password

app:
  mail:
    enabled: true
```

To get Gmail App Password:
1. Enable 2-Step Verification in Google Account
2. Go to App Passwords
3. Generate password for "Mail"

## 🏃 Running the Application

### Start Services in Order

```bash
# Terminal 1: Start Eureka Server
cd eureka-server
mvn spring-boot:run

# Terminal 2: Start API Gateway
cd api-gateway
mvn spring-boot:run

# Terminal 3: Start Auth Service
cd auth-service
mvn spring-boot:run

# Terminal 4: Start Job Service
cd job-service
mvn spring-boot:run

# Terminal 5: Start Application Service
cd application-service
mvn spring-boot:run

# Terminal 6: Start Frontend
cd frontend
npm start
```

### Access Points
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API Gateway | http://localhost:8080 |
| Eureka Dashboard | http://localhost:8761 |

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs/search` | Search jobs with filters |
| GET | `/api/jobs/{id}` | Get job by ID |
| POST | `/api/jobs` | Create job (Employer) |
| PUT | `/api/jobs/{id}` | Update job (Employer) |
| DELETE | `/api/jobs/{id}` | Deactivate job (Employer) |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications` | Apply for job |
| GET | `/api/applications/my-applications` | Get my applications |
| GET | `/api/applications/employer/applications` | Get employer's applications |
| PUT | `/api/applications/{id}/status` | Update application status |

### Favorites
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jobs/favorites/{jobId}` | Add to favorites |
| DELETE | `/api/jobs/favorites/{jobId}` | Remove from favorites |
| GET | `/api/jobs/favorites` | Get favorite jobs |

## 📁 Project Structure

```
job-portal/
├── eureka-server/          # Service Discovery
├── api-gateway/            # API Gateway with JWT Auth
├── auth-service/           # Authentication & User Management
├── job-service/            # Job CRUD & Favorites
├── application-service/    # Job Applications & Email
├── frontend/               # React Frontend
├── pom.xml                 # Parent POM
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

⭐ Star this repository if you found it helpful!
