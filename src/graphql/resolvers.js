const Transaction = require("../models/Transaction");
const Goal = require("../models/Goal");

const resolvers = {
  getTransactions: async (args, context) => {
    if (!context.userId) {
      throw new Error("Não autenticado");
    }
    return await Transaction.find({ userId: context.userId });
  },

  createTransaction: async ({ input }, context) => {
    if (!context.userId) {
      throw new Error("Você precisa estar logado para criar uma transação.");
    }

    try {
      const newTransaction = new Transaction({
        ...input,
        userId: context.userId
      });

      const saved = await newTransaction.save();
      return saved;
    } catch (error) {
      throw new Error("Erro ao salvar transação: " + error.message);
    }
  },

  createGoal: async ({ input }, context) => {
    if (!context.userId) {
      throw new Error("Não autenticado");
    }

    try {
      const newGoal = new Goal({
        ...input,
        userId: context.userId
      });

      return await newGoal.save();
    } catch (error) {
      throw new Error("Erro ao salvar meta: " + error.message);
    }
  }
};

module.exports = resolvers;