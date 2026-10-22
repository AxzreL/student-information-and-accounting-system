# Samar State University - Student Information and Accounting System (SIAS)

An enterprise-grade **Student Information and Accounting Management System (SIAS)** designed for Higher Education, featuring role-based workflows for Administrators, Registrars, and Cashiers, dynamic subject enrollment with real-time fee calculation, and paper-accurate printable financial documents.

---

## 🏛️ Features Overview

- **👑 Super Administrator Portal**:
  - Academic Term Manager (configure and toggle the active semester).
  - Standard Tuition and Miscellaneous Fee schedule masterlist.
  - Comprehensive Audit Trail logging all administrative and financial activities with timestamps.

- **🎓 University Registrar Workspace**:
  - **Student Directory**: Search by Student Number, Name, Degree Program, or Year Level.
  - **Student Registration**: Register new students with automatic student number generation (`YYYY-XXXXX`).
  - **Subject-Level Enrollment**: Interactive subject picker with real-time tally of Lecture Units, Laboratory Units, total credit units, live tuition preview, and scholarship grants (e.g., UniFAST Free Higher Education, Academic Scholar, Employee Dependent).

- **💵 Cashier & Accounting Workspace**:
  - **Student Accounts Ledger**: Real-time breakdown of Gross Assessment, Discounts/Scholarships, Net Due, Total Paid, and Remaining Balance.
  - **Payment Collection**: Multi-mode payment support (Cash, GCash, Maya, Bank Transfer, Check) with quick payment shortcuts (Full Balance, Downpayment, Installment).
  - **Exam Permit Clearance Engine**: Automatically computes exam clearance status (`CLEARED` vs `HOLD`) once the minimum installment or downpayment threshold is fulfilled.

- **🖨️ Paper-Accurate Printable Documents**:
  - **Official Receipt (OR)**: Formal receipt with auto-incrementing OR numbers (`OR-YYYY-XXXXX`), payment breakdown, remaining balance, and cashier signatures.
  - **Certificate of Registration & Assessment (COR/RAF)**: Official student study load showing enrolled subject codes, descriptive titles, units, schedule, room, fee breakdown, and Registrar signatures.
  - **Statement of Account (SOA) & Student Ledger**: Detailed debit/credit transaction ledger with installment milestones (Downpayment, Prelims, Midterms, Finals) and official **Exam Permit Clearance Stamp**.

- **🎨 Modern Enterprise EdTech UI & Dark Mode**:
  - Deep Navy/Slate palette with Emerald/Teal accents, glassmorphic panels, and responsive tabular figures.
  - **Circular Screen Transition**: Animated radial circle reveal expanding from the switch button to transform the entire screen.
  - Persistent theme preference saved in `localStorage`.

---

## 🛠️ Technology Stack

- **Frontend & Backend**: [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Database**: [MySQL 8.4+](https://www.mysql.com/) (compatible with Laragon, XAMPP, or standalone MySQL)
- **ORM & Migrations**: [Prisma ORM](https://www.prisma.io/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS & CSS Variables for total control, high performance, and smooth theme transitions

---

## 🚀 Getting Started for Groupmates & Collaborators

Follow these simple steps to run this project on your computer:

### 1. Clone the Repository
```bash
git clone https://github.com/AxzreL/student-information-and-accounting-system.git
cd student-information-and-accounting-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup the Database (Laragon or XAMPP)
1. Make sure your local **MySQL server** is running (e.g. click **Start All** in Laragon or start MySQL in XAMPP).
2. Open your MySQL client (HeidiSQL, phpMyAdmin, or MySQL CLI) and create the database:
   ```sql
   CREATE DATABASE sias_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Check your `.env` file to ensure the database URL matches your local setup:
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/sias_db"
   ```
   *(If your MySQL root user has a password, change it to `mysql://root:yourpassword@localhost:3306/sias_db`)*.

### 4. Push Schema & Seed Initial Data
Run the following commands to create all tables and populate realistic college records, programs, fee schedules, and sample accounts:
```bash
# Push Prisma schema to MySQL
npx prisma db push

# Seed the database with sample students, courses, fees, and transactions
node prisma/seed.js
```

### 5. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser!

---

## 👥 Demo User Accounts

You can test any role directly using the **Fast Role Switcher** at the top of the screen:
- **Administrator**: `Dr. Alejandro Gomez` (`admin@sias.edu.ph` / `admin123`)
- **University Registrar**: `Maria Elena Veloso` (`registrar@sias.edu.ph` / `registrar123`)
- **Finance & Cashier Officer**: `Roberto Fernandez, CPA` (`cashier@sias.edu.ph` / `cashier123`)

---

## 📄 License
Academic Project developed for Samar State University.
