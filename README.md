# Restaurant Ordering System – Node.js Backend

## 1. Project Overview

This project converts an existing backend system built with **Spring Boot** into a backend built with **Node.js** and **Express.js**.

The system supports restaurant operations such as:

* Authentication and authorization
* User management
* Dish and category management
* Table management
* Order and invoice processing
* Payment management
* Notification and messaging
* Real-time communication

### Technology Stack

Backend technologies used:

* Node.js
* Express.js
* MySQL Server
* JWT Authentication
* Socket.IO (Realtime communication)

---

# 2. Project Structure

```
backend
│
├── bin
│   └── www
│
├── controllers
│
├── node_modules
│
├── routes
│
├── schemas
│
├── utils
│
├── .gitignore
├── app.js
├── package.json
└── package-lock.json
```

---

# 3. Git Workflow

Branch structure:

```
main        → production
develop     → integration branch
feature/*   → feature development
```

### Feature Branch Naming

```
feature/project-setup
feature/auth-security
feature/user-management
feature/category-dish
feature/table-management
feature/order-invoice
feature/payment-notification
feature/realtime-message
```

### Development Flow

1. Pull latest develop

```
git checkout develop
git pull origin develop
```

2. Create feature branch

```
git checkout -b feature/feature-name
```

3. Push branch

```
git push origin feature/feature-name
```

4. Create Pull Request → develop

---

# 4. Team Responsibilities

Project members:

* Truong
* Han

Development is divided by **system layer and business modules**.

---

# 5. Task Assignment

## Truong – System Core & Security

Responsible for core infrastructure and authentication.

### Feature 1 – Project Setup

Branch:

```
feature/project-setup
```

Tasks:

* Setup Node.js project
* Setup Express server
* Setup MySQL connection
* Create base folder structure
* Setup error handling middleware

Files created:

```
app.js
server.js
config/db.js
middlewares/error.middleware.js
```

---

### Feature 2 – Authentication & Security

Branch:

```
feature/auth-security
```

Convert Spring Boot components:

```
SecurityConfig
JwtUtil
JwtAuthenticationFilter
AuthController
AuthService
```

To Node.js structure:

```
utils/authHandler.js
middlewares/auth.middleware.js
controllers/auth.controller.js
services/auth.service.js
routes/auth.routes.js
```

Features implemented:

* Login
* Register
* JWT token generation
* Route protection middleware

---

### Feature 3 – User Management

Branch:

```
feature/user-management
```

Convert:

```
UserEntity
UserService
UserController
UserRepository
```

To Node.js:

```
schemas/user.model.js
controllers/user.controller.js
services/user.service.js
routes/user.routes.js
```

Functions:

* Create user
* Update user
* Delete user
* Get user list

---

### Feature 4 – Realtime Messaging

Branch:

```
feature/realtime-message
```

Convert Spring WebSocket modules to:

```
socket/socket.js
schemas/message.model.js
controllers/message.controller.js
services/message.service.js
```

Technology:

Socket.IO

Features:

* Send message
* Receive message
* Broadcast notification

---

# Han – Business Logic Modules

Responsible for restaurant operations.

---

## Feature 5 – Category & Dish Management

Branch:

```
feature/category-dish
```

Convert:

```
CategoryEntity
DishEntity
CategoryController
DishController
```

To Node.js:

```
schemas/category.model.js
schemas/dish.model.js
controllers/category.controller.js
controllers/dish.controller.js
services/category.service.js
services/dish.service.js
routes/category.routes.js
routes/dish.routes.js
```

Functions:

* Create category
* Update category
* Create dish
* Update dish
* Get dish list

---

## Feature 6 – Table Management

Branch:

```
feature/table-management
```

Convert:

```
TableEntity
TableController
TableService
```

To:

```
schemas/table.model.js
controllers/table.controller.js
services/table.service.js
routes/table.routes.js
```

Functions:

* Create table
* Update table
* Change table status

---

## Feature 7 – Order & Invoice

Branch:

```
feature/order-invoice
```

Convert:

```
InvoiceEntity
InvoiceItemEntity
InvoiceService
```

To Node.js:

```
schemas/invoice.model.js
schemas/invoiceItem.model.js
controllers/invoice.controller.js
services/invoice.service.js
routes/invoice.routes.js
```

Functions:

* Create order
* Add dish to order
* Update order
* Calculate total price

---

## Feature 8 – Payment & Notification

Branch:

```
feature/payment-notification
```

Convert:

```
PaymentEntity
NotificationEntity
```

To:

```
schemas/payment.model.js
schemas/notification.model.js
controllers/payment.controller.js
services/payment.service.js
routes/payment.routes.js
```

Functions:

* Process payment
* Payment status
* Send notification

---

# 6. Development Timeline

### Day 1

Truong:

```
feature/project-setup
```

Han:

```
feature/category-dish
```

---

### Day 2–3

Truong:

```
feature/auth-security
```

Han:

```
feature/table-management
```

---

### Day 4–5

Truong:

```
feature/user-management
```

Han:

```
feature/order-invoice
```

---

### Day 6

Truong:

```
feature/realtime-message
```

Han:

```
feature/payment-notification
```

---

### Day 7

Both members:

* Merge feature branches into develop
* Integration testing
* Fix bugs

---

# 7. How to Run Project

Install dependencies:

```
npm install
```

Run server:

```
npm start
```

Development mode:

```
npm run dev
```

Server default port:

```
http://localhost:8080
```

---

# 8. Expected Outcome

After completion, the system will provide a full backend API for the restaurant ordering system with:

* Authentication system
* Restaurant management modules
* Order processing
* Payment handling
* Real-time messaging
* RESTful API architecture
