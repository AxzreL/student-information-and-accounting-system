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

### 5. Start the Systems

This solution features **two separate, integrated systems** running on independent ports:

#### System 1: Student Information and Accounting System (SIAS)
The system of record for student profiles, enrollment, courses, sections, fees, assessments, payments, balances, and receipts.
```bash
# In the root project directory:
npm run dev
```
Runs at [http://localhost:3000](http://localhost:3000).

#### System 2: Student Grades Portal (SGP)
The separate portal where teachers encode grades and students view them, featuring weighted grade computation (Prelim 30%, Midterm 30%, Finals 40%), class records, and printable collegiate report cards / grade slips.
```bash
# In a separate terminal:
cd student-grades-portal
npm install
npm run dev
```
Runs at [http://localhost:3001](http://localhost:3001).

---

## 🔗 How SIAS and SGP Integrate

1. **Student Data & Class Lists**: SGP reads student enrollments and subject loads directly from SIAS via REST API (`http://localhost:3000/api/sgp/...`), ensuring no duplicate registrations.
2. **Balance Clearance Policy ("No Clearance, No Grades")**: SGP checks the student's live balance and exam permit status in SIAS before unlocking official grades or allowing report card printing.
   - Cleared students (e.g. `Mark Anthony Reyes` `2024-00101` or scholar `Princess Mae Tan` `2024-00102`) can view grades and print their Certificate of Grades.
   - Students with unsettled balances (e.g. `Sarah Jane Mendoza` `2024-00201`) see their grades withheld with a direct link to the SIAS Cashier.
3. **Subjects & Sections Master**: SIAS owns all subjects, units, schedules, rooms, and sections; SGP consumes them for instructor class records.
4. **Academic Clearance Reports**: SIAS Registrar can pull academic standings, GWA, and passed/failed units from SGP to cross-reference with cashier clearances for graduation and re-enrollment.

---

## 👥 Authentication & Demo Accounts

Both systems feature dedicated login screens with **1-click demo presets** or manual credential entry:

### 1. SIAS Administrative Login (Port 3000)
| Role | Email | Password | Access / Description |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@sias.edu.ph` | `admin123` | Full system oversight, academic terms, fee templates, audit logs |
| **University Registrar** | `registrar@sias.edu.ph` | `registrar123` | Student admissions, subject enrollment, study loads, academic clearance |
| **Finance & Cashier** | `cashier@sias.edu.ph` | `cashier123` | Student ledger, payment posting, official receipts, exam permit clearance |

### 2. SGP Grades Portal Login (Port 3001)
* **Faculty / Teacher Login:**
  | Instructor | Email | Password | Assigned Classes |
  | :--- | :--- | :--- | :--- |
  | **Prof. Maria Santos, MSIT** | `faculty@sias.edu.ph` | `faculty123` | Introduction to Computing, Discrete Math |
  | **Engr. Dan Gomez, MIT** | `dgomez@sias.edu.ph` | `faculty123` | Computer Programming 1 (Python) |
  | **Dr. Alicia Tan, PhD** | `atan@sias.edu.ph` | `faculty123` | Understanding the Self |

* **Student Portal Login:**
  | Student Name | Student No. | Password | SIAS Financial Clearance Status |
  | :--- | :--- | :--- | :--- |
  | **Mark Anthony Reyes** | `2024-00101` | `student123` | **CLEARED** (Partial payment, ₱4,600 bal) — Grades Unlocked (GWA 1.49) |
  | **Princess Mae Tan** | `2024-00102` | `student123` | **CLEARED** (UniFAST Scholar, ₱0 bal) — President's List (GWA 1.07) |
  | **Sarah Jane Mendoza** | `2024-00201` | `student123` | **HOLD** (Unpaid ₱5,650 bal) — Official Grades Withheld |

---

## 📄 License
Academic Project developed for Samar State University.
