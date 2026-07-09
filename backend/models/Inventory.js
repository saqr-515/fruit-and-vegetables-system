const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  quantity: { type: Number, default: 0 },
  unit: { type: String, default: 'kg' }, // e.g., 'kg', 'box', 'ton'
  costPrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  minLimit: { type: Number, default: 0 }, // For low stock alerts
}, { timestamps: true });

module.exports = mongoose.model('Inventory', InventorySchema);
