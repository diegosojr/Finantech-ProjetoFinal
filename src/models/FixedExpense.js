const mongoose = require("mongoose");

const FixedExpenseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ["Internet", "Agua", "Luz", "Aluguel", "Feira", "Outros"],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  paid: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("FixedExpense", FixedExpenseSchema);