const Transaction = require("../models/Transaction");
const FixedExpense = require("../models/FixedExpense");

module.exports = {
  monthlySummary: async ({ startDate, endDate }, context) => {
    try {
      if (!context.userId) {
        throw new Error("Usuário não autenticado");
      }

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const receitas = await Transaction.aggregate([
        {
          $match: {
            userId: context.userId,
            type: "receita",
            date: { $gte: start, $lte: end }
          }
        },
        { $group: { _id: null, total: { $sum: "$value" } } }
      ]);

      const despesas = await Transaction.aggregate([
        {
          $match: {
            userId: context.userId,
            type: "despesa",
            date: { $gte: start, $lte: end }
          }
        },
        { $group: { _id: null, total: { $sum: "$value" } } }
      ]);

      const despesasFixas = await FixedExpense.aggregate([
        {
          $match: {
            userId: context.userId,
            date: { $gte: start, $lte: end }
          }
        },
        { $group: { _id: null, total: { $sum: "$value" } } }
      ]);

      const fixedExpensesList = await FixedExpense.find({
        userId: context.userId,
        date: { $gte: start, $lte: end }
      }).sort({ date: 1 });

      const totalReceitas = receitas[0]?.total || 0;
      const totalDespesas = despesas[0]?.total || 0;
      const totalDespesasFixas = despesasFixas[0]?.total || 0;
      const saldoPeriodo = totalReceitas - totalDespesas - totalDespesasFixas;

      return {
        receitas: totalReceitas,
        despesas: totalDespesas,
        despesasFixas: totalDespesasFixas,
        saldo: saldoPeriodo,
        fixedExpensesList: fixedExpensesList.map((item) => ({
          _id: item._id.toString(),
          userId: item.userId,
          category: item.category,
          description: item.description,
          value: item.value,
          date: item.date.toISOString(),
          paid: item.paid ? "true" : "false"
        }))
      };
    } catch (error) {
      throw new Error(error.message || "Erro ao buscar resumo mensal");
    }
  }
};