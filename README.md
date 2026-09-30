# M.A.M.S. Frontend (Military Asset Management System)

React + Vite frontend for the Military Asset Management System. Provides real-time asset tracking, inter-base transfer execution, purchases, personnel assignments, expenditures, and dashboard inventory analytics with Role-Based Access Control (RBAC).

---

## 🚀 Features

- **Dashboard Metrics**: Real-time inventory movement, acquisitions, inter-base transfers, personnel assignments, and expenditures.
- **Base Support**: Filter and manage assets across all 4 operational bases:
  - `Western (WB)`
  - `Central (CB)`
  - `Southern (SB)`
  - `Eastern (EB)`
- **20 Standard Military Assets**: Complete tracking for Armoured Vehicles, Artillery, Rocket Systems, Transport & Support Vehicles, Helicopters, Small Arms, and Ammunition.
- **Direct Inter-Base Transfers**: Auto-completed transfers that move inventory immediately between source and destination bases.
- **Role-Based Views**: Dynamic navigation and permissions for `ADMIN`, `BASE_COMMANDER`, and `LOGISTICS_OFFICER`.

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Vanilla CSS Design System (Slate/Navy theme)
- **HTTP Client**: Axios with JWT Interceptors
- **Routing**: React Router v6

---

## 💻 Getting Started Locally

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- Running M.A.M.S. Backend API at `http://localhost:8080`

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/munichandra588/MAMS_Frontend.git
cd MAMS_Frontend

# Install dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
The application will be running at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
Production assets are generated in the `dist/` directory.

---

## 🔐 Default Login Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **ADMIN** | `admin@mams.mil` | `admin123` | Full administrative control |
| **BASE_COMMANDER** | `commander@mams.mil` | `commander123` | All-base operations, transfers, assignments & expenditures |
| **LOGISTICS_OFFICER** | `logistics@mams.mil` | `logistics123` | Stock intake & purchase records |
