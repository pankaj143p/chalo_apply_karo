# Job Portal - Project Presentation

---

## Slide 1: Title Slide

---

# 🎯 JOB PORTAL

### A Full-Stack Job Search System
### Built with Spring Boot Microservices & React

---

**Presented By:** [Your Name]

**Roll No:** [Your Roll Number]

**Course:** [Your Course Name]

**Guide:** [Your Guide's Name]

**Date:** December 2025

---

## Slide 2: Introduction & Problem Statement

---

### 📌 INTRODUCTION

Job Portal is a comprehensive web application that connects job seekers with employers through a modern, scalable microservices-based platform. The system provides real-time application tracking, email notifications, and a seamless user experience.

---

### 📌 PROBLEM STATEMENT

- Traditional job search methods are time-consuming and inefficient
- Lack of real-time application status tracking for candidates
- No centralized platform for comprehensive job management
- Difficulty in connecting qualified candidates with relevant employers
- Manual application processes lead to delays and miscommunication
- Employers struggle to manage large volumes of applications

---

### 📌 SOLUTION

A microservices-based job portal with:
- Real-time email notifications
- Application status tracking
- Seamless user experience for both job seekers and employers
- Scalable architecture for future growth

---

## Slide 3: Features

---

### 👤 FOR JOB SEEKERS

| Feature | Description |
|---------|-------------|
| 🔍 **Search & Filter** | Search jobs by location, type, experience level |
| 📝 **Easy Apply** | Apply for jobs with cover letter and resume |
| ❤️ **Save Favorites** | Save interesting jobs for later |
| 📊 **Track Status** | Monitor application status (Pending → Reviewed → Shortlisted → Interview → Accepted/Rejected) |
| 📧 **Email Alerts** | Receive notifications on status changes |
| 📈 **Dashboard** | View statistics and recent activities |

---

### 👔 FOR EMPLOYERS

| Feature | Description |
|---------|-------------|
| 📮 **Post Jobs** | Create new job listings easily |
| ✏️ **Manage Postings** | Edit and update job postings |
| 🔄 **Soft Delete** | Activate/Deactivate jobs without permanent deletion |
| 👥 **View Applicants** | Browse and manage all applications |
| 📋 **Update Status** | Change application status with automatic email notifications |
| 📈 **Analytics Dashboard** | View hiring statistics and metrics |

---

## Slide 4: System Architecture

---

### 🏗️ MICROSERVICES ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│                      Port: 3000                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 API Gateway (Spring Cloud)                   │
│                      Port: 8080                              │
│               • JWT Authentication Filter                    │
│               • Request Routing                              │
│               • Load Balancing                               │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│Auth Service │   │ Job Service │   │ Application │
│ Port: 8081  │   │ Port: 8082  │   │   Service   │
│             │   │             │   │ Port: 8083  │
│ • Register  │   │ • CRUD Jobs │   │ • Apply     │
│ • Login     │   │ • Search    │   │ • Status    │
│ • JWT Token │   │ • Favorites │   │ • Email     │
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘
       │                 │                 │
       └────────────────┬┴─────────────────┘
                        │
              ┌─────────▼─────────┐
              │    PostgreSQL     │
              │    Database       │
              └─────────┬─────────┘
                        │
              ┌─────────▼─────────┐
              │   Eureka Server   │
              │    Port: 8761     │
              │ Service Discovery │
              └───────────────────┘
```

---

### 🔄 Service Communication Flow

1. **Client Request** → Frontend sends request to API Gateway
2. **Authentication** → Gateway validates JWT token
3. **Service Discovery** → Gateway queries Eureka for service location
4. **Routing** → Request forwarded to appropriate microservice
5. **Database** → Service processes request with PostgreSQL
6. **Response** → Result returned through Gateway to Frontend

---

## Slide 5: Technology Stack

---

### 🔧 BACKEND TECHNOLOGIES

| Technology | Version | Purpose |
|------------|---------|---------|
| ☕ Java | 17 | Programming Language |
| 🍃 Spring Boot | 3.2.0 | Application Framework |
| ☁️ Spring Cloud | 2023.0.0 | Microservices Support |
| 🚪 Spring Cloud Gateway | - | API Gateway |
| 📋 Netflix Eureka | - | Service Discovery |
| 💾 Spring Data JPA | - | Database ORM |
| 📧 Spring Mail | - | Email Notifications |
| 🔐 JWT | - | Authentication |
| 📦 Lombok | - | Boilerplate Reduction |

---

### 🎨 FRONTEND TECHNOLOGIES

| Technology | Version | Purpose |
|------------|---------|---------|
| ⚛️ React | 18 | UI Framework |
| 🔀 React Router DOM | - | Client-side Routing |
| 📡 Axios | - | HTTP Client |
| 🔔 React Toastify | - | Toast Notifications |
| 🎭 React Icons | - | Icon Library |
| 🎨 CSS3 | - | Styling |

---

### 🗄️ DATABASE & TOOLS

| Technology | Version | Purpose |
|------------|---------|---------|
| 🐘 PostgreSQL | 15 | Relational Database |
| 🔍 Eureka Server | - | Service Registry |
| 📦 Maven | 3.8+ | Build Tool |
| 🟢 Node.js | 18+ | Frontend Runtime |

---

## Slide 6: Application Modules

---

### 📦 BACKEND MICROSERVICES

| # | Service | Port | Responsibilities |
|---|---------|------|------------------|
| 1 | **Eureka Server** | 8761 | Service Discovery & Registration |
| 2 | **API Gateway** | 8080 | Centralized Entry Point, JWT Filter, Routing |
| 3 | **Auth Service** | 8081 | User Registration, Login, Token Management |
| 4 | **Job Service** | 8082 | Job CRUD, Search, Filters, Favorites |
| 5 | **Application Service** | 8083 | Job Applications, Status Updates, Email Notifications |

---

### 📱 FRONTEND MODULES

#### Common Pages
- **Home Page** - Landing page with overview
- **Job Search** - Search with filters (location, type, experience)
- **Job Detail** - Full job information with apply option
- **Login/Register** - User authentication
- **Profile** - User profile management

#### Job Seeker Pages
- **Dashboard** - Statistics, recent applications, recommended jobs
- **My Applications** - Track all submitted applications
- **Favorite Jobs** - Saved/bookmarked jobs

#### Employer Pages
- **Dashboard** - Hiring statistics, recent applications
- **Post Job** - Create new job listings
- **Manage Jobs** - Edit, activate/deactivate jobs
- **View Applications** - Review and manage applicants

---

## Slide 7: Application Workflow

---

### 🔄 JOB SEEKER WORKFLOW

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌────────────────┐
│ Register │ ──► │ Search Jobs  │ ──► │ View Details │ ──► │ Apply with     │
│ / Login  │     │ with Filters │     │ & Save       │     │ Cover Letter   │
└──────────┘     └──────────────┘     └──────────────┘     └────────────────┘
      │                                                            │
      │                                                            ▼
      │                                                   ┌────────────────┐
      │                                                   │ Receive Email  │
      │                                                   │ Confirmation   │
      │                                                   └────────────────┘
      │                                                            │
      ▼                                                            ▼
┌──────────────────┐                                    ┌────────────────────┐
│ Dashboard with   │ ◄───────────────────────────────── │ Track Application  │
│ Statistics       │                                    │ Status Updates     │
└──────────────────┘                                    └────────────────────┘
```

---

### 🔄 EMPLOYER WORKFLOW

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌────────────────┐
│ Register │ ──► │ Post New     │ ──► │ View         │ ──► │ Update App     │
│ / Login  │     │ Job Listing  │     │ Applicants   │     │ Status         │
└──────────┘     └──────────────┘     └──────────────┘     └────────────────┘
      │                                                            │
      │                                                            ▼
      │                                                   ┌────────────────┐
      │                                                   │ Candidate Gets │
      │                                                   │ Email Alert    │
      │                                                   └────────────────┘
      │                                                            │
      ▼                                                            ▼
┌──────────────────┐                                    ┌────────────────────┐
│ Dashboard with   │ ◄───────────────────────────────── │ Manage All Jobs    │
│ Hiring Stats     │                                    │ & Applications     │
└──────────────────┘                                    └────────────────────┘
```

---

### 📊 APPLICATION STATUS FLOW

```
PENDING ──► REVIEWED ──► SHORTLISTED ──► INTERVIEW ──► ACCEPTED
                                              │
                                              └──────► REJECTED
```

Each status change triggers an **automatic email notification** to the candidate.

---

## Slide 8: Conclusion & Thank You

---

### 📌 CONCLUSION

✅ Successfully developed a **scalable microservices-based** job portal application

✅ Implemented **secure JWT authentication** across all services

✅ Built **real-time email notifications** for application status updates

✅ Created **user-friendly interfaces** for both job seekers and employers

✅ Achieved **separation of concerns** with independent microservices

✅ Enabled **service discovery** with Eureka for dynamic scaling

---

### 📌 FUTURE ENHANCEMENTS

| Enhancement | Description |
|-------------|-------------|
| 🤖 **AI Recommendations** | ML-based job matching based on skills and preferences |
| 📄 **Resume Parsing** | Automatic extraction of skills from uploaded resumes |
| 🎥 **Video Interviews** | Integrated video interview scheduling and conducting |
| 📱 **Mobile App** | Native Android/iOS applications |
| 💬 **Real-time Chat** | Direct messaging between employers and candidates |
| 📊 **Advanced Analytics** | Detailed insights and reporting dashboards |

---

### 🙏 THANK YOU!

---

**Questions & Discussion Welcome**

---

**Contact Information:**

📧 Email: [Your Email Address]

🔗 GitHub: github.com/pankaj143p/chalo_apply_karo

💼 LinkedIn: [Your LinkedIn Profile]

---

*Thank you for your attention!*

---

## Appendix: API Endpoints Reference

### Auth Service (Port: 8081)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Job Service (Port: 8082)
- `GET /api/jobs` - Get all jobs (paginated)
- `GET /api/jobs/{id}` - Get job by ID
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/{id}` - Update job
- `DELETE /api/jobs/{id}` - Delete job
- `GET /api/jobs/search` - Search jobs with filters
- `POST /api/favorites/{jobId}` - Add to favorites
- `GET /api/favorites` - Get user favorites

### Application Service (Port: 8083)
- `POST /api/applications` - Submit application
- `GET /api/applications/my` - Get user's applications
- `GET /api/applications/job/{jobId}` - Get applications for a job
- `PUT /api/applications/{id}/status` - Update application status

---
