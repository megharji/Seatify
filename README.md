# Ticket Booking System 🎟️

## 📌 Project Overview

This is a full-stack ticket booking system with wallet integration, seat reservation, and admin dashboard.

---

## ⚙️ Tech Stack

* Backend: Node.js (Express)
* Frontend: React.js
* Database: MongoDB

---

## 🚀 Features

* User authentication (JWT)
* Wallet system (credit/debit)
* Seat reservation (5 min lock)
* Booking system with atomic transactions
* Admin dashboard (events, bookings, refunds)

---

## 🛠️ Setup Instructions

### Backend

```bash
cd Backend(Node)
npm install
npm run dev
```

### Frontend

```bash
cd Frontend(React)
npm install
npm run dev
```

---

## 🌐 Deployment

Frontend: (Vercel link)
Backend: (Render link)


---

## ⚠️ Edge Cases Handled

* No double booking
* No double payment
* Reservation expiry
* Idempotent APIs
