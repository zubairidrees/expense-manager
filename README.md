
# Expense Tracker Backend

## Description
Expense Tracker API built with **Node.js**, **Express**, and **MongoDB**. This project provides endpoints to manage expenses, authentication, and user management. It uses **JWT** for authentication, **Bcrypt** for hashing passwords, and **Swagger** for API documentation.

## Features
- User authentication with **JWT**.
- Expense tracking (add, update, delete, get expenses).
- Swagger API documentation for easy reference.

## Technologies Used
- **Node.js**
- **Express**
- **MongoDB**
- **JWT Authentication**
- **Bcrypt for Password Hashing**
- **Swagger for API Documentation**

## Installation

### Clone the Repository
```bash
git clone https://github.com/zubairidrees/expense-tracker-backend.git
```

### Install Dependencies
Navigate to the project directory and install the necessary dependencies:
```bash
cd expense-tracker-backend
npm install
```

### Environment Variables
Make sure to create a `.env` file in the root directory and add the following environment variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your-jwt-secret
```

## Available Scripts

### Start the Application
Run the following command to start the application in **production mode**:
```bash
npm start
```

### Development Mode
For development, run the following command which automatically restarts the server on code changes:
```bash
npm run dev
```

### Run Tests
To run the tests, use the following command:
```bash
npm test
```
This will execute the tests using Jest and provides feedback on the status of each test.

### Swagger Documentation
Once the application is running, you can view the API documentation at:
```
http://localhost:5000/api-docs
```
Swagger UI will display all available API endpoints and allow you to test them directly from the browser.

## API Endpoints

### User Endpoints
- `POST /api/auth/register` – Register a new user.
- `POST /api/auth/login` – Log in and receive a JWT token.

### Expense Endpoints
- `GET /api/expenses` – Retrieve all expenses.
- `POST /api/expenses` – Create a new expense.
- `PUT /api/expenses/:id` – Update an expense.
- `DELETE /api/expenses/:id` – Delete an expense.

## Testing

### Run Tests Locally
To run the tests locally, ensure that MongoDB is running, and then use the following command:
```bash
npm test
```

This will execute all tests using **Jest** and check for errors in the codebase.

## License
This project is licensed under the **ISC License**.

## Authors
- **Your Name** - Zubair Idrees (https://github.com/zubairidrees)
