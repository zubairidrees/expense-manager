const Expense = require("../models/Expense");

// Create Expense
exports.createExpense = async (req, res) => {
    try {
        const requiredFields = ["title", "amount", "category"];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length) {
            return res.status(400).json({ message: `${missingFields.join(", ")} is required` });
        }

        const expense = new Expense(req.body);
        await expense.save();
        res.status(201).json(expense);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get All Expenses
exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Expense by ID
exports.getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) return res.status(404).json({ message: "Expense not found" });
        res.json(expense);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Expense
exports.updateExpense = async (req, res) => {
    try {
        const allowedUpdates = ["title", "amount", "category", "description", "date"];
        const updates = Object.keys(req.body);

        if (!updates.length || updates.some(update => !allowedUpdates.includes(update))) {
            return res.status(400).json({ message: "Invalid update parameters" });
        }

        const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!expense) return res.status(404).json({ message: "Expense not found" });

        res.json(expense);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete Expense
exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) return res.status(404).json({ message: "Expense not found" });

        res.json({ message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.searchExpenses = async (req, res) => {
    try {
        const query = req.query.query; // Use req.query.query for query parameters

        // If the query is missing or empty, return all expenses
        const filter = query && query.trim() !== ""
            ? {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { category: { $regex: query, $options: "i" } }
                ]
            }
            : {}; // Empty object to fetch all expenses if no query

        const expenses = await Expense.find(filter);

        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


