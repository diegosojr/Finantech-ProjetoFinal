const Transaction = require("../models/Transaction");
const Goal = require("../models/Goal");
const FixedExpense = require("../models/FixedExpense");

exports.createTransaction = async (req, res) => {
  try {
    const { type, value, category, description, date } = req.body;

    const transaction = new Transaction({
      userId: req.userId,
      type,
      value,
      category,
      description,
      date
    });

    await transaction.save();

    res.status(201).json(transaction);
  } catch (error) {
    console.log("ERRO CREATE TRANSACTION:");
    console.log(error);
    res.status(500).json({
      error: "Erro ao criar transação",
      details: error.message
    });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const { name, value, deadline } = req.body;

    const goal = new Goal({
      userId: req.userId,
      name,
      value,
      deadline,
      completed: false
    });

    await goal.save();

    res.status(201).json(goal);
  } catch (error) {
    console.log("ERRO CREATE GOAL:");
    console.log(error);
    res.status(500).json({
      error: "Erro ao criar meta",
      details: error.message
    });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({
      userId: req.userId
    }).sort({ deadline: 1 });

    res.json(goals);
  } catch (error) {
    console.log("ERRO GET GOALS:");
    console.log(error);
    res.status(500).json({
      error: "Erro ao buscar metas",
      details: error.message
    });
  }
};

exports.toggleGoalCompleted = async (req, res) => {
  try {
    const { id } = req.params;

    const goal = await Goal.findOne({
      _id: id,
      userId: req.userId
    });

    if (!goal) {
      return res.status(404).json({
        error: "Meta não encontrada"
      });
    }

    goal.completed = !goal.completed;
    await goal.save();

    res.json({
      message: "Status da meta atualizado com sucesso",
      goal
    });
  } catch (error) {
    console.log("ERRO TOGGLE GOAL COMPLETED:");
    console.log(error);
    res.status(500).json({
      error: "Erro ao atualizar status da meta",
      details: error.message
    });
  }
};

exports.createFixedExpense = async (req, res) => {
  try {
    const { category, description, value, date } = req.body;

    const fixedExpense = new FixedExpense({
      userId: req.userId,
      category,
      description,
      value,
      date,
      paid: false
    });

    await fixedExpense.save();

    res.status(201).json(fixedExpense);
  } catch (error) {
    console.log("ERRO CREATE FIXED EXPENSE:");
    console.log(error);
    res.status(500).json({
      error: "Erro ao criar despesa fixa",
      details: error.message
    });
  }
};

exports.getFixedExpenses = async (req, res) => {
  try {
    const fixedExpenses = await FixedExpense.find({
      userId: req.userId
    }).sort({ date: 1 });

    res.json(fixedExpenses);
  } catch (error) {
    console.log("ERRO GET FIXED EXPENSES:");
    console.log(error);
    res.status(500).json({
      error: "Erro ao buscar despesas fixas",
      details: error.message
    });
  }
};

exports.toggleFixedExpensePaid = async (req, res) => {
  try {
    const { id } = req.params;

    const fixedExpense = await FixedExpense.findOne({
      _id: id,
      userId: req.userId
    });

    if (!fixedExpense) {
      return res.status(404).json({
        error: "Despesa fixa não encontrada"
      });
    }

    fixedExpense.paid = !fixedExpense.paid;
    await fixedExpense.save();

    res.json({
      message: "Status de pagamento atualizado com sucesso",
      fixedExpense
    });
  } catch (error) {
    console.log("ERRO TOGGLE FIXED EXPENSE PAID:");
    console.log(error);
    res.status(500).json({
      error: "Erro ao atualizar pagamento da despesa fixa",
      details: error.message
    });
  }
};

exports.updateFixedExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, description, value, date } = req.body;

    const fixedExpense = await FixedExpense.findOne({
      _id: id,
      userId: req.userId
    });

    if (!fixedExpense) {
      return res.status(404).json({
        error: "Despesa fixa não encontrada"
      });
    }

    fixedExpense.category = category;
    fixedExpense.description = description;
    fixedExpense.value = value;
    fixedExpense.date = date;

    await fixedExpense.save();

    res.json({
      message: "Despesa fixa atualizada com sucesso",
      fixedExpense
    });
  } catch (error) {
    console.log("ERRO UPDATE FIXED EXPENSE:");
    console.log(error);
    res.status(500).json({
      error: "Erro ao atualizar despesa fixa",
      details: error.message
    });
  }
};

exports.deleteFixedExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const fixedExpense = await FixedExpense.findOneAndDelete({
      _id: id,
      userId: req.userId
    });

    if (!fixedExpense) {
      return res.status(404).json({
        error: "Despesa fixa não encontrada"
      });
    }

    res.json({
      message: "Despesa fixa excluída com sucesso"
    });
  } catch (error) {
    console.log("ERRO DELETE FIXED EXPENSE:");
    console.log(error);
    res.status(500).json({
      error: "Erro ao excluir despesa fixa",
      details: error.message
    });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const receitas = await Transaction.aggregate([
      { $match: { userId: req.userId, type: "receita" } },
      { $group: { _id: null, total: { $sum: "$value" } } }
    ]);

    const despesas = await Transaction.aggregate([
      { $match: { userId: req.userId, type: "despesa" } },
      { $group: { _id: null, total: { $sum: "$value" } } }
    ]);

    const metas = await Goal.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: null, total: { $sum: "$value" } } }
    ]);

    const totalReceitas = receitas[0]?.total || 0;
    const totalDespesas = despesas[0]?.total || 0;
    const totalMetas = metas[0]?.total || 0;
    const saldo = totalReceitas - totalDespesas - totalMetas;

    res.json({
      receitas: totalReceitas,
      despesas: totalDespesas,
      metas: totalMetas,
      saldo
    });
  } catch (error) {
    console.log("ERRO DASHBOARD:");
    console.log(error);
    res.status(500).json({
      error: "Erro ao buscar dashboard",
      details: error.message
    });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.userId
    }).sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    console.log("ERRO GET TRANSACTIONS:");
    console.log(error);
    res.status(500).json({
      error: "Erro ao buscar transações",
      details: error.message
    });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, value, category, description, date } = req.body;

    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.userId
    });

    if (!transaction) {
      return res.status(404).json({
        error: "Transação não encontrada"
      });
    }

    transaction.type = type;
    transaction.value = value;
    transaction.category = category;
    transaction.description = description;
    transaction.date = date;

    await transaction.save();

    res.json({
      message: "Transação atualizada com sucesso",
      transaction
    });
  } catch (error) {
    console.log("ERRO UPDATE TRANSACTION:");
    console.log(error);
    res.status(500).json({
      error: "Erro ao atualizar transação",
      details: error.message
    });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.userId
    });

    if (!transaction) {
      return res.status(404).json({
        error: "Transação não encontrada"
      });
    }

    res.json({
      message: "Transação excluída com sucesso"
    });
  } catch (error) {
    console.log("ERRO DELETE TRANSACTION:");
    console.log(error);
    res.status(500).json({
      error: "Erro ao excluir transação",
      details: error.message
    });
  }
};

exports.getMonthlySummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: "Informe startDate e endDate"
      });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const receitas = await Transaction.aggregate([
      {
        $match: {
          userId: req.userId,
          type: "receita",
          date: { $gte: start, $lte: end }
        }
      },
      { $group: { _id: null, total: { $sum: "$value" } } }
    ]);

    const despesas = await Transaction.aggregate([
      {
        $match: {
          userId: req.userId,
          type: "despesa",
          date: { $gte: start, $lte: end }
        }
      },
      { $group: { _id: null, total: { $sum: "$value" } } }
    ]);

    const despesasFixas = await FixedExpense.aggregate([
      {
        $match: {
          userId: req.userId,
          date: { $gte: start, $lte: end }
        }
      },
      { $group: { _id: null, total: { $sum: "$value" } } }
    ]);

    const fixedExpensesList = await FixedExpense.find({
      userId: req.userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    const totalReceitas = receitas[0]?.total || 0;
    const totalDespesas = despesas[0]?.total || 0;
    const totalDespesasFixas = despesasFixas[0]?.total || 0;
    const saldoPeriodo = totalReceitas - totalDespesas - totalDespesasFixas;

    res.json({
      receitas: totalReceitas,
      despesas: totalDespesas,
      despesasFixas: totalDespesasFixas,
      saldo: saldoPeriodo,
      fixedExpensesList
    });
  } catch (error) {
    console.log("ERRO GET MONTHLY SUMMARY:");
    console.log(error);
    res.status(500).json({
      error: "Erro ao buscar resumo mensal",
      details: error.message
    });
  }
};