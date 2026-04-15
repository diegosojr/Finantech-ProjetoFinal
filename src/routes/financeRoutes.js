const express = require("express");
const router = express.Router();
const financeController = require("../controllers/financeController");
const auth = require("../middlewares/auth");

router.post("/transaction", auth, financeController.createTransaction);
router.get("/transactions", auth, financeController.getTransactions);
router.put("/transaction/:id", auth, financeController.updateTransaction);
router.delete("/transaction/:id", auth, financeController.deleteTransaction);

router.post("/goal", auth, financeController.createGoal);
router.get("/goals", auth, financeController.getGoals);
router.patch("/goal/:id/toggle-completed", auth, financeController.toggleGoalCompleted);

router.post("/fixed-expense", auth, financeController.createFixedExpense);
router.get("/fixed-expenses", auth, financeController.getFixedExpenses);
router.patch("/fixed-expense/:id/toggle-paid", auth, financeController.toggleFixedExpensePaid);
router.put("/fixed-expense/:id", auth, financeController.updateFixedExpense);
router.delete("/fixed-expense/:id", auth, financeController.deleteFixedExpense);

router.get("/dashboard", auth, financeController.getDashboard);
router.get("/monthly-summary", auth, financeController.getMonthlySummary);

module.exports = router;