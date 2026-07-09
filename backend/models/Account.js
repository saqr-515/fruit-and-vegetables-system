const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  phone: { type: String },
  type: { type: String, enum: ['customer', 'supplier'], default: 'customer' },
  balance: { type: Number, default: 0 }, // Positive = Debt (User owes us), Negative = Credit (We owe user)
  transactions: [{
    date: { type: Date, default: Date.now },
    description: { type: String },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    runningBalance: { type: Number }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Account', AccountSchema);
