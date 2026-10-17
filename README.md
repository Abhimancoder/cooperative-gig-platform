# 🤝 CoopServe — Cooperative Gig Services Platform

**SIH 2026 | Problem Statement: SIH26089 | Ministry of Cooperation | Theme: Smart Automation**

> A worker-owned digital platform connecting households with verified local service providers — built on cooperative principles of fair pay, democratic governance, and community welfare.

---

## 🏆 What Makes Us Different

| Traditional Gig Apps | CoopServe (Cooperative) |
|---|---|
| Company owned, profit-extractive | Worker co-owned, profit-sharing |
| Opaque fee deductions | Transparent earnings breakdown |
| No worker voice | Democratic voting on policies |
| No welfare provisions | Integrated welfare fund |
| Algorithm-driven exploitation | Ethical AI matching |

---

## ✨ Key Features

### 👤 For Customers
- Browse service categories (Cleaning, Plumbing, Electrical, Carpentry, Cooking, etc.)
- Book instant or scheduled services
- Real-time provider tracking on map
- UPI-based payments with digital invoices
- Rate and review service providers

### 🔧 For Service Providers (Cooperative Members)
- Join as a cooperative member with verified KYC
- Accept/reject job requests with full transparency
- Earnings dashboard with clear fee breakdown
- Participate in cooperative governance (vote on policies)
- Access social welfare fund contributions

### 🏛️ For Cooperative Admin
- Member management and KYC approval
- Revenue analytics and reporting
- Democratic governance facilitation
- Dispute resolution panel
- Welfare fund management

### 🤖 AI-Powered Features
- Smart provider matching (distance + skills + rating)
- Demand forecasting for service areas
- Automated fraud detection
- AI chatbot for customer support

---

## 🛠️ Tech Stack

```
Frontend:   React.js + Tailwind CSS
Backend:    Node.js + Express.js
Database:   PostgreSQL + Prisma ORM
Real-time:  Socket.io
Payments:   Razorpay (UPI)
Maps:       Leaflet.js + OpenStreetMap
Auth:       JWT + Firebase OTP
AI/ML:      Python FastAPI microservice
Cloud:      AWS / Docker
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

### 1. Clone and Install
```bash
git clone <repo-url>
cd cooperative-gig-platform

# Install backend
cd server && npm install

# Install frontend
cd ../client && npm install
```

### 2. Configure Environment
```bash
# Backend
cp server/.env.example server/.env
# Edit server/.env with your DB credentials, JWT secret, Razorpay keys

# Frontend
cp client/.env.example client/.env
```

### 3. Setup Database
```bash
cd server
npx prisma migrate dev --name init
node seed.js
```

### 4. Run the Application
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm start
```

### 5. Access the App
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **API Docs:** http://localhost:5000/api-docs

---

## 📁 Project Structure

```
cooperative-gig-platform/
├── client/          # React.js Web Application
├── server/          # Node.js + Express Backend API
├── ai-service/      # Python FastAPI ML Microservice (Phase 4)
├── docker-compose.yml
└── README.md
```

---

## 👥 Team

Built for Smart India Hackathon 2026 | SIH26089

---

## 📜 License

MIT License — Built with ❤️ for India's cooperative workforce
