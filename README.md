# Smart Expense & Budget Tracker 💰

> An enterprise-grade, full-stack personal finance and budgetary management web application built with **Java 17**, **Spring Boot 3.3.4**, and **React.js 18 (Vite)**. Features real-time Indian Rupee (₹) ledger management, proactive threshold-based spending alerts, client-side SVG financial visualizations, and robust Role-Based Access Control (RBAC).

[![Java](https://img.shields.io/badge/Java-17%20LTS-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4.2-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 Key Features

* **🇮🇳 Indian Rupee (₹) Localization**: All monetary values, calculations, metrics, and charts are denominated in Indian Rupees (`₹`), tailored for UPI, Net Banking, Cards, and Cash transactions.
* **🔐 Secure Authentication & RBAC**: Stateless JSON Web Token (`JJWT`) authentication with **BCrypt** password hashing, email verification, self-service password reset, and distinct roles (`ROLE_USER` & `ROLE_ADMIN`).
* **📊 Comprehensive Financial Ledger**: Full CRUD support for Income and Expense transactions with category classification, payment methods, transaction dates, pagination, and multi-field search.
* **⚠️ Proactive Budget Warning Engine**: Monthly category budgets evaluated in real time against active billing cycles, triggering **80% (Warning)** and **100% (Exceeded)** visual alerts.
* **📈 Native Client-Side SVG Charts**: Lightweight, high-performance donut charts (category expense share) and comparative income-vs-expense bar charts without heavy external graphing dependencies.
* **🔁 Recurring Transaction Engine**: Automated scheduling for weekly, monthly, and yearly recurring monetary flows.
* **🛡️ Admin Governance Portal**: Real-time user directory auditing, verification status tracking, and platform-wide financial activity monitoring.
* **🔄 Dual-Engine Persistence**: Production-ready MySQL 8.0 support with embedded zero-config H2 database fallback for instant local testing and development.

---

## 🏗️ Architecture & Tech Stack

```
smart-expense-tracker/
├── backend/                       # Spring Boot 3 REST API Server
│   ├── src/main/java/             # Controllers, Services, Repositories, Entities, Security
│   ├── src/main/resources/        # application.properties (MySQL & H2 profiles)
│   ├── mvnw & mvnw.cmd            # Cross-platform Maven Wrapper
│   ├── pom.xml                    # Maven dependencies configuration
│   └── Dockerfile                 # Multi-stage Docker build for backend
├── frontend/                      # React 18 SPA (Vite)
│   ├── src/                       # Components, Contexts, Pages, CSS modules
│   ├── package.json               # Node dependencies
│   ├── vite.config.js             # Vite build & proxy settings
│   ├── nginx.conf                 # Production Nginx reverse-proxy config
│   ├── vercel.json                # Vercel SPA rewrite routing
│   └── Dockerfile                 # Multi-stage Docker build with Nginx
├── .github/workflows/             # GitHub Actions CI/CD pipelines
│   └── ci.yml                     # Automated build & test workflows
├── docker-compose.yml             # Full-stack local & production container orchestration
├── render.yaml                    # 1-Click Render cloud deployment blueprint
├── start-all.bat & start-all.sh   # 1-Click full-stack launcher scripts
├── run-backend.bat & run-backend.sh
├── run-frontend.bat & run-frontend.sh
└── README.md
```

---

## 🚀 Quick Start (Run Locally)

### Prerequisites
* **Java 17 LTS or higher** (`java -version`)
* **Node.js 18+ and npm** (`node -v` & `npm -v`)

---

### Option A: 1-Click Launcher (Recommended)

#### On Windows:
Double-click `start-all.bat` in the root folder, or run in Command Prompt / PowerShell:
```cmd
start-all.bat
```

#### On Linux / macOS:
```bash
chmod +x *.sh backend/mvnw
./start-all.sh
```

Both services will start automatically:
* 🌐 **Frontend UI**: [http://localhost:5173](http://localhost:5173)
* ⚙️ **Backend API**: [http://localhost:8080/api](http://localhost:8080/api)
* 🗄️ **H2 In-Memory DB Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console) (JDBC URL: `jdbc:h2:mem:expensedb`, Username: `sa`, Password: *blank*)

---

### Option B: Run via Docker Compose

Run the entire full-stack application (Backend + Frontend + Nginx reverse proxy) in isolated containers with one command:

```bash
docker compose up --build
```

Access the application at:
* 🌐 **Web App**: [http://localhost](http://localhost) (or [http://localhost:5173](http://localhost:5173))
* ⚙️ **Backend API**: [http://localhost:8080/api](http://localhost:8080/api)

To stop the containers:
```bash
docker compose down
```

---

### Option C: Manual Terminal Start

#### 1. Start the Backend:
```bash
cd backend
# Windows
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2

# Linux / Mac
chmod +x mvnw
./mvnw spring-boot:run -Dspring-boot.run.profiles=h2
```

#### 2. Start the Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Default Test Credentials

Pre-loaded seed accounts for testing:

| Role | Username | Email | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin@expensetracker.com` | `Admin@123` | Full administrative oversight & user auditing |
| **Standard User** | `dinesh` | `dinesh@example.com` | `User@123` | Personal transactions, budgets & analytics |
| **Standard User** | `varaprasad` | `prasad@example.com` | `User@123` | Personal transactions, budgets & analytics |

*(You can also register any new account directly from the **Sign Up** screen!)*

---

## 🚢 Deploy to Cloud Using GitHub

### Step 1: Push Code to Your GitHub Account

1. Open your terminal in the `smart-expense-tracker` root folder:
   ```bash
   cd smart-expense-tracker
   ```
2. Verify git status:
   ```bash
   git status
   ```
3. Create a new repository on [GitHub](https://github.com/new) named `smart-expense-tracker`.
4. Link and push your repository:
   ```bash
   git remote add origin https://github.com/<YOUR-USERNAME>/smart-expense-tracker.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: 1-Click Deploy on Render (Free Tier)

This repository includes a `render.yaml` blueprint:

1. Log in to [Render](https://render.com/).
2. Click **New +** -> **Blueprint**.
3. Connect your GitHub repository `smart-expense-tracker`.
4. Render will automatically detect `render.yaml` and provision:
   - **`smart-expense-backend`** (Spring Boot web service)
   - **`smart-expense-frontend`** (Static React SPA)
5. Click **Apply**. Both services will build and deploy automatically!

---

### Step 3: Deploy Frontend on Vercel (Alternative)

1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Set **Root Directory** to `frontend`.
5. Under **Environment Variables**, set:
   - `VITE_API_BASE_URL` = `https://<YOUR-RENDER-BACKEND-URL>/api`
6. Click **Deploy**. Vercel will build and serve your React app globally with instant edge CDN!

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate & retrieve JWT token | No |
| `POST` | `/api/auth/forgot-password`| Request password reset token | No |
| `POST` | `/api/auth/reset-password` | Set new password via token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (`Bearer`) |
| `GET` | `/api/transactions` | List user transactions (paginated & filtered) | Yes (`Bearer`) |
| `POST` | `/api/transactions` | Record new transaction (evaluates budgets) | Yes (`Bearer`) |
| `PUT` | `/api/transactions/{id}` | Update existing transaction | Yes (`Bearer`) |
| `DELETE`| `/api/transactions/{id}` | Delete transaction | Yes (`Bearer`) |
| `GET` | `/api/transactions/stats`| Get spending stats & SVG chart aggregates | Yes (`Bearer`) |
| `GET` | `/api/budgets` | Fetch monthly category budget limits | Yes (`Bearer`) |
| `POST` | `/api/budgets` | Configure category monthly allowance | Yes (`Bearer`) |
| `DELETE`| `/api/budgets/{id}` | Remove category budget cap | Yes (`Bearer`) |
| `GET` | `/api/admin/users` | Directory of registered users | Yes (`ROLE_ADMIN`) |
| `DELETE`| `/api/admin/users/{id}`| Remove malicious or spam user account | Yes (`ROLE_ADMIN`) |

---

## 🧪 Testing

* **Backend Unit & Integration Tests**:
  ```bash
  cd backend
  ./mvnw test
  ```
* **Frontend Production Build Test**:
  ```bash
  cd frontend
  npm run build
  ```

---

## 👥 Authors & Academic Credits

* **P DINESH REDDY** (Hall Ticket: `23EG112A43`)
* **C. VARA PRASAD** (Hall Ticket: `23EG112A30`)
* **Project Guide**: Mrs. G. Bhanu Priya, Assistant Professor
* **Head of Department**: Dr. Niteesha Sharma, Professor & Head
* **Department**: Department of Information Technology, **Anurag University**

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
