const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["receita", "despesa"],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ["Salario", "Freelance", "Investimento", "Outros"],
    required: true
  },
  description: {
    type: String
  },
  date: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model("Transaction", TransactionSchema);