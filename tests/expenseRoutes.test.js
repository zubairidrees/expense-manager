const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Assuming you have a User model
const Expense = require("../models/Expense");
const expenseRoutes = require("../routes/expenseRoutes");
const authRoutes = require("../routes/userRoutes");  // Add auth routes
const app = express();

app.use(express.json());
app.use("/api/expenses", expenseRoutes);
app.use("/api/auth", authRoutes); // Make sure auth routes are mounted

// Define authentication middleware (Move this into a middleware file if needed)
const authenticate = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    try {
        const decoded = jwt.verify(token, "your-secret-key"); // Ensure using the same secret as your app
        req.user = decoded; // Attach user info to request
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Test suite for authenticated Expense API endpoints
describe("Expense API Endpoints with Authentication", () => {
    let expenseId;
    let authToken;

    // Register and Login user before tests
    beforeAll(async () => {
        // Clean up previous data
        await User.deleteMany();
        await Expense.deleteMany();

        // Register a test user
        const userRes = await request(app)
            .post("/api/auth/register") // Assuming this is your register route
            .send({
                username: "testuser",
                password: "testpassword",
            });

        expect(userRes.statusCode).toBe(201);
        
        // Login to get the token
        const loginRes = await request(app)
            .post("/api/auth/login") // Assuming this is your login route
            .send({
                username: "testuser",
                password: "testpassword",
            });

        expect(loginRes.statusCode).toBe(200);
        authToken = loginRes.body.token; // Assuming your login returns a token
        expect(authToken).toBeDefined();
    });

    beforeEach(async () => {
        await Expense.deleteMany(); // Ensure a clean DB state before each test
    });

    test("✅ POST /api/expenses - Create an expense (Valid Data)", async () => {
        const res = await request(app)
            .post("/api/expenses")
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                title: "Lunch",
                amount: 150,
                category: "Food",
                date: "2024-02-15"
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("_id");
        expect(res.body.title).toBe("Lunch");
        expect(res.body.amount).toBe(150);
        expenseId = res.body._id;
    });

    test("❌ POST /api/expenses - Fail if no auth token", async () => {
        const res = await request(app)
            .post("/api/expenses")
            .send({
                title: "Lunch",
                amount: 150,
                category: "Food",
                date: "2024-02-15"
            });

        expect(res.statusCode).toBe(401); // Unauthorized
        expect(res.body.message).toBe("Authentication required");
    });

    test("✅ GET /api/expenses - Retrieve all expenses", async () => {
        await Expense.create({ title: "Rent", amount: 500, category: "Housing", date: "2024-02-15" });

        const res = await request(app)
            .get("/api/expenses")
            .set("Authorization", `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty("title", "Rent");
    });

    test("❌ GET /api/expenses - Fail if no auth token", async () => {
        const res = await request(app).get("/api/expenses");

        expect(res.statusCode).toBe(401); // Unauthorized
        expect(res.body.message).toBe("Authentication required");
    });

    test("✅ GET /api/expenses/:id - Retrieve an expense by ID", async () => {
        const newExpense = await Expense.create({
            title: "Internet Bill",
            amount: 50,
            category: "Utilities",
            date: "2024-02-15"
        });

        const res = await request(app)
            .get(`/api/expenses/${newExpense._id}`)
            .set("Authorization", `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe("Internet Bill");
    });

    test("✅ PUT /api/expenses/:id - Update an expense", async () => {
        const newExpense = await Expense.create({
            title: "Electricity Bill",
            amount: 70,
            category: "Bills",
            date: "2024-02-15"
        });

        const res = await request(app)
            .put(`/api/expenses/${newExpense._id}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({ amount: 80 });

        expect(res.statusCode).toBe(200);
        expect(res.body.amount).toBe(80);
    });

    test("❌ PUT /api/expenses/:id - Invalid Update Request (No Auth)", async () => {
        const newExpense = await Expense.create({
            title: "Electricity Bill",
            amount: 70,
            category: "Bills",
            date: "2024-02-15"
        });

        const res = await request(app)
            .put(`/api/expenses/${newExpense._id}`)
            .send({ invalidField: "xyz" });

        expect(res.statusCode).toBe(401); // Unauthorized
    });

    test("✅ DELETE /api/expenses/:id - Delete an expense", async () => {
        const newExpense = await Expense.create({
            title: "Fuel",
            amount: 30,
            category: "Transport",
            date: "2024-02-15"
        });

        const res = await request(app)
            .delete(`/api/expenses/${newExpense._id}`)
            .set("Authorization", `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Expense deleted successfully");

        const found = await Expense.findById(newExpense._id);
        expect(found).toBeNull();
    });

    test("❌ DELETE /api/expenses/:id - Fail if no auth token", async () => {
        const newExpense = await Expense.create({
            title: "Fuel",
            amount: 30,
            category: "Transport",
            date: "2024-02-15"
        });

        const res = await request(app).delete(`/api/expenses/${newExpense._id}`);

        expect(res.statusCode).toBe(401); // Unauthorized
        expect(res.body.message).toBe("Authentication required");
    });

    test("✅ POST /api/auth/register - Register a new user", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                username: "newuser",
                password: "newpassword",
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "User registered successfully");
    });

});
