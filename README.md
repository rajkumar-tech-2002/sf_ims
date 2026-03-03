# SF-IMS: Inventory Management System

A premium, role-based Inventory Management System built with the MERN stack (MySQL, Express, React, Node.js).

## 🚀 Features

- **Secure Authentication**: Role-based access control (Admin, Manager, Staff) using JWT stored in secure `httpOnly` cookies.
- **Stock Entry**: Complete CRUD operations for inventory management (Add, View, Edit, Delete).
- **Responsive Dashboard**: Modern UI with real-time analytics and inventory tracking.
- **Premium Design**: Built with Tailwind CSS, Lucide Icons, and a focus on visual excellence.
- **Data Integrity**: Powered by a robust MySQL database schema.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide-React
- **Backend**: Node.js, Express, JWT, Cookie-parser
- **Database**: MySQL

## 📦 Setup Instructions

### 1. Prerequisite
- Node.js (v18+)
- MySQL Server

### 2. Backend Setup
1. Navigate to the `server` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on your environment:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=ims
   JWT_SECRET=your_secret_key
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the `client` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📜 Database Schema

The project uses the following key tables:
- `users`: Stores user credentials and roles.
- `stock_master`: Stores product information and inventory levels.

---
Developed by [Rajkumar](https://github.com/rajkumar-tech-2002)
