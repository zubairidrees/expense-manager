const express = require('express');
const {
    createExpense, getExpenses, getExpenseById,
    updateExpense, deleteExpense, searchExpenses
} = require('../controllers/expenseController');

const router = express.Router();

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
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the expense
 *         title:
 *           type: string
 *           description: Expense title
 *         amount:
 *           type: number
 *           description: Expense amount
 *         category:
 *           type: string
 *           description: Expense category
 *         date:
 *           type: string
 *           format: date
 *           description: Date of expense
 */

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
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
 *         description: Bad request
 */
router.post('/', createExpense);

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get all expenses
 *     tags: [Expenses]
 *     responses:
 *       200:
 *         description: List of all expenses
 */
router.get('/', getExpenses);

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Get a single expense by ID
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The expense ID
 *     responses:
 *       200:
 *         description: Expense found
 *       404:
 *         description: Expense not found
 */
router.get('/:id', getExpenseById);

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Update an expense
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The expense ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *       404:
 *         description: Expense not found
 */
router.put('/:id', updateExpense);

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Delete an expense
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The expense ID
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *       404:
 *         description: Expense not found
 */
router.delete('/:id', deleteExpense);

/**
 * @swagger
 * /api/expenses/search/{query}:
 *   get:
 *     summary: Search expenses by title or category
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword
 *     responses:
 *       200:
 *         description: List of matching expenses
 */
router.get('/search/:query', searchExpenses);

module.exports = router;
