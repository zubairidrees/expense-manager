const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const Expense = require("../models/Expense"); // Your Mongoose model
const expenseRoutes = require("../routes/expenseRoutes"); // Your API routes

const app = express();
app.use(express.json());
app.use("/api/expenses", expenseRoutes);

describe("Expense API Endpoints", () => {
    let expenseId;

    beforeEach(async () => {
        await Expense.deleteMany(); // Ensure a clean DB state before each test
    });

    test("✅ POST /api/expenses - Create an expense (Valid Data)", async () => {
        const res = await request(app)
            .post("/api/expenses")
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

    test("❌ POST /api/expenses - Fail if required fields are missing", async () => {
        const res = await request(app).post("/api/expenses").send({
            amount: 100,
            category: "Transport"
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("title is required"); // Assuming your API handles this validation
    });

    test("✅ GET /api/expenses - Retrieve all expenses", async () => {
        await Expense.create({ title: "Rent", amount: 500, category: "Housing", date: "2024-02-15" });

        const res = await request(app).get("/api/expenses");

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty("title", "Rent");
    });

    test("✅ GET /api/expenses/:id - Retrieve an expense by ID", async () => {
        const newExpense = await Expense.create({
            title: "Internet Bill",
            amount: 50,
            category: "Utilities",
            date: "2024-02-15"
        });

        const res = await request(app).get(`/api/expenses/${newExpense._id}`);

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
            .send({ amount: 80 });

        expect(res.statusCode).toBe(200);
        expect(res.body.amount).toBe(80);
    });

    test("❌ PUT /api/expenses/:id - Invalid Update Request", async () => {
        const newExpense = await Expense.create({
            title: "Electricity Bill",
            amount: 70,
            category: "Bills",
            date: "2024-02-15"
        });

        const res = await request(app)
            .put(`/api/expenses/${newExpense._id}`)
            .send({ invalidField: "xyz" });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Invalid update parameters");
    });

    test("✅ DELETE /api/expenses/:id - Delete an expense", async () => {
        const newExpense = await Expense.create({
            title: "Fuel",
            amount: 30,
            category: "Transport",
            date: "2024-02-15"
        });

        const res = await request(app).delete(`/api/expenses/${newExpense._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Expense deleted successfully");

        const found = await Expense.findById(newExpense._id);
        expect(found).toBeNull();
    });

    test("❌ GET /api/expenses/:id - 404 Not Found", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app).get(`/api/expenses/${fakeId}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Expense not found");
    });
});
