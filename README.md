# 🚜 Water Tanker Management System

A web-based platform to efficiently manage daily water tanker trips and tractor allocations to factories in villages. Built for union heads and tractor drivers to ensure fair distribution of trips, transparent record-keeping, and ease of coordination.

---

## 🔧 Features

### 🧑‍✈️ Admin (Union Head)
- Assign daily trips to tankers based on rotation and cutoff rules
- Manage companies and schedule allocations
- Track trip counts per driver for the current month
- View and export trip reports (daily/monthly)
- Enforce fair rotation: if a driver is absent, the next in serial order takes over
- Role-based access control

### 🚜 Driver
- Login using mobile number (OTP)
- View assigned company and trip count for the day
- Accept or decline trip assignments
- View personal trip statistics vs cutoff

### 🧠 Smart Logic
- 100 tankers registered with unique serials (1 to 100)
- Daily trip allotment based on:
  - Number of trips required by a company
  - Number of tankers to participate that day
  - Fair rotation to meet monthly cutoff
- Drivers' availability affects the serial; absentees are skipped
- Tankers are not mutually assigned to multiple companies on the same day unless allowed

---

## 📸 Demo Screenshots

![Dashboard](./screenshots/dashboard.png)
![Driver View](./screenshots/driver.png)

---

## 🛠️ Tech Stack

- **Frontend**: HTML, TailwindCSS, JavaScript
- **Backend**: Supabase (Auth, Database, Storage)
- **Hosting**: Vercel
- **Auth**: Supabase OTP via Mobile Number
- **Deployment**: GitHub → Vercel CI/CD

---

## 🧾 Setup Instructions

```bash
# Clone this repo
git clone https://github.com/your-username/village-trip-manager.git
cd village-trip-manager

# Install dependencies
npm install

# Run the app (if applicable)
npm run dev
