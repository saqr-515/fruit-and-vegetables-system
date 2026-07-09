const mongoose = require('mongoose');

const InvoiceItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  name: { type: String, required: true },
  weight: { type: Number, required: true },
  boxWeight: { type: Number, default: 0 },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true }
});

const InvoiceSchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  customerName: { type: String, required: true },
  items: [InvoiceItemSchema],
  totalWeight: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
