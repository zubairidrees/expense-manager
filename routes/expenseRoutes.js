const express = require('express');
const authenticate = require('../middleware/authMiddleware'); // Import the authenticate middleware
const Expense = require('../models/Expense');
const router = express.Router();
const logger = require('../config/logger'); // Assuming you have a custom logger setup

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expense management routes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       required:
 *         - title
 *         - amount
 *         - category
 *         - user
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated ID of the expense
 *         title:
 *           type: string
 *           description: Title of the expense
 *         amount:
 *           type: number
 *           description: Amount of the expense
 *         category:
 *           type: string
 *           description: Category of the expense
 *         description:
 *           type: string
 *           description: Additional description (optional)
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the expense
 *         user:
 *           type: string
 *           description: ID of the user who owns the expense
 */

/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       201:
 *         description: Expense created successfully
 *       400:
 *         description: Missing required fields or bad request
 *       500:
 *         description: Internal server error
 */
router.post("/", authenticate, async (req, res) => {
    try {
        logger.info('Received request to create expense');
        const requiredFields = ["title", "amount", "category"];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length) {
            logger.warn(`Missing required fields: ${missingFields.join(", ")}`);
            return res.status(400).json({ message: `${missingFields.join(", ")} is required` });
        }

        const expense = new Expense({
            ...req.body,
            user: req.user._id // Save the user ID with the expense
        });

        await expense.save();
        logger.info('Expense created successfully');
        res.status(201).json(expense);
    } catch (error) {
        logger.error('Error creating expense', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /expenses:
 *   get:
 *     summary: Get all expenses of the authenticated user
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of expenses
 *       500:
 *         description: Internal server error
 */
router.get("/", authenticate, async (req, res) => {
    try {
        logger.info('Received request to fetch all expenses');
        const expenses = await Expense.find({ user: req.user._id });
        logger.info('Expenses retrieved successfully');
        res.json(expenses);
    } catch (error) {
        logger.error('Error retrieving expenses', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /expenses/{id}:
 *   get:
 *     summary: Get a specific expense by ID
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense found
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", authenticate, async (req, res) => {
    try {
        logger.info(`Received request to fetch expense with ID: ${req.params.id}`);
        const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
        if (!expense) {
            logger.warn(`Expense not found for ID: ${req.params.id}`);
            return res.status(404).json({ message: "Expense not found" });
        }
        logger.info(`Expense with ID: ${req.params.id} found`);
        res.json(expense);
    } catch (error) {
        logger.error('Error retrieving expense', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /expenses/{id}:
 *   put:
 *     summary: Update an existing expense
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *       400:
 *         description: Invalid update parameters
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", authenticate, async (req, res) => {
    try {
        logger.info(`Received request to update expense with ID: ${req.params.id}`);
        const allowedUpdates = ["title", "amount", "category", "description", "date"];
        const updates = Object.keys(req.body);

        if (!updates.length || updates.some(update => !allowedUpdates.includes(update))) {
            logger.warn(`Invalid update parameters for expense with ID: ${req.params.id}`);
            return res.status(400).json({ message: "Invalid update parameters" });
        }

        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!expense) {
            logger.warn(`Expense not found for ID: ${req.params.id}`);
            return res.status(404).json({ message: "Expense not found" });
        }

        logger.info(`Expense with ID: ${req.params.id} updated successfully`);
        res.json(expense);
    } catch (error) {
        logger.error('Error updating expense', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /expenses/{id}:
 *   delete:
 *     summary: Delete an expense
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", authenticate, async (req, res) => {
    try {
        logger.info(`Received request to delete expense with ID: ${req.params.id}`);
        const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!expense) {
            logger.warn(`Expense not found for ID: ${req.params.id}`);
            return res.status(404).json({ message: "Expense not found" });
        }

        logger.info(`Expense with ID: ${req.params.id} deleted successfully`);
        res.json({ message: "Expense deleted successfully" });
    } catch (error) {
        logger.error('Error deleting expense', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /expenses/search:
 *   get:
 *     summary: Search expenses by title or category
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query for title or category
 *     responses:
 *       200:
 *         description: List of matching expenses
 *       500:
 *         description: Internal server error
 */
router.get("/search/", authenticate, async (req, res) => {
    try {
        logger.info ('Full Query Parameters:', req.query); 
        const query = req.query.query;
        logger.info(`Received request to search expenses with query: ${query}`);

        // If no query is provided, return all expenses for the user
        const filter = query && query.trim() !== ""
            ? { $or: [{ title: { $regex: query, $options: "i" } }, { category: { $regex: query, $options: "i" } }] }
            : {};  // Empty filter when no query is provided

        // Ensure req.user._id is valid
        if (!req.user || !req.user._id) {
            return res.status(400).json({ error: "User not authenticated" });
        }

        // Fetch expenses based on filter and user ID
        const expenses = await Expense.find({ ...filter, user: req.user._id });

        logger.info('Expenses search completed successfully');
        res.json(expenses);
    } catch (error) {
        logger.error('Error searching expenses', error);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
