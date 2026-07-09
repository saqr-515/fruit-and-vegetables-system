require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const Account = require('./models/Account');
const Inventory = require('./models/Inventory');
const Invoice = require('./models/Invoice');

// --- ROUTES ---

// 1. ACCOUNTS
app.get('/api/accounts', async (req, res) => {
  try {
    const accounts = await Account.find().sort({ name: 1 });
    res.json(accounts);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/accounts', async (req, res) => {
  try {
    const newAccount = new Account(req.body);
    await newAccount.save();
    res.status(201).json(newAccount);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// 2. INVENTORY
app.get('/api/inventory', async (req, res) => {
  try {
    const items = await Inventory.find().sort({ name: 1 });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/inventory', async (req, res) => {
  try {
    const newItem = new Inventory(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// 3. INVOICES (Transaction Safe)
app.post('/api/invoices', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { accountId, items, totalWeight, totalAmount } = req.body;
    const account = await Account.findById(accountId).session(session);
    if (!account) throw new Error('Account not found');

    const invoice = new Invoice({ accountId, customerName: account.name, items, totalWeight, totalAmount });
    await invoice.save({ session });

    for (const item of items) {
      const product = await Inventory.findById(item.productId).session(session);
      if (!product) throw new Error(`Product ${item.name} not found`);
      product.quantity -= (item.weight - item.boxWeight);
      await product.save({ session });
    }

    account.balance += totalAmount;
    account.transactions.push({
      description: `فاتورة مبيعات رقم #${invoice._id.toString().slice(-6)}`,
      debit: totalAmount,
      credit: 0,
      runningBalance: account.balance
    });
    await account.save({ session });

    await session.commitTransaction();
    res.status(201).json({ success: true, invoice });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally { session.endSession(); }
});

// 4. PAYMENTS
app.post('/api/payments', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { accountId, amount, notes } = req.body;
    const account = await Account.findById(accountId).session(session);
    if (!account) throw new Error('Account not found');

    account.balance -= amount;
    account.transactions.push({
      description: notes || 'سند قبض كاش',
      debit: 0,
      credit: amount,
      runningBalance: account.balance
    });
    await account.save({ session });

    await session.commitTransaction();
    res.json({ success: true, newBalance: account.balance });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally { session.endSession(); }
});

// 5. DASHBOARD STATS (Live Calculation)
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todaySales = await Invoice.aggregate([
      { $match: { date: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const totalDebts = await Account.aggregate([
      { $match: { type: 'customer' } },
      { $group: { _id: null, total: { $sum: "$balance" } } }
    ]);

    const lowStock = await Inventory.countDocuments({ $expr: { $lte: ["$quantity", "$minLimit"] } });

    // حساب الكاش المحصل اليوم من سجل المعاملات
    const accounts = await Account.find({ "transactions.date": { $gte: startOfDay } });
    let cashReceivedToday = 0;
    accounts.forEach(acc => {
      acc.transactions.forEach(t => {
        if (t.date >= startOfDay && t.credit > 0) {
          cashReceivedToday += t.credit;
        }
      });
    });

    res.json({
      todaySales: todaySales[0]?.total || 0,
      totalDebts: totalDebts[0]?.total || 0,
      lowStockCount: lowStock,
      cashReceivedToday: cashReceivedToday
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
