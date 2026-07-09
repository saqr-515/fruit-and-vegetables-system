require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database Models
const Account = require('./models/Account');
const Inventory = require('./models/Inventory');
const Invoice = require('./models/Invoice');

// --- AUTO SEEDING LOGIC ---
const seedIfEmpty = async () => {
  const count = await Inventory.countDocuments();
  if (count === 0) {
    const initialItems = [
      { name: "بندورة نخب أول", quantity: 0, unit: "كغم", sellingPrice: 3.5, minLimit: 100 },
      { name: "خيار بلدي", quantity: 0, unit: "كغم", sellingPrice: 3, minLimit: 100 },
      { name: "بطاطا زراعية", quantity: 0, unit: "كغم", sellingPrice: 2.5, minLimit: 200 },
      { name: "بصل أحمر", quantity: 0, unit: "كغم", sellingPrice: 1.5, minLimit: 300 },
      { name: "ليمون بلدي", quantity: 0, unit: "كغم", sellingPrice: 4, minLimit: 50 },
      { name: "تفاح جولا", quantity: 0, unit: "صندوق", sellingPrice: 55, minLimit: 10 },
      { name: "موز أريحا", quantity: 0, unit: "كغم", sellingPrice: 5, minLimit: 100 }
    ];
    await Inventory.insertMany(initialItems);
    console.log("🌱 Database auto-seeded.");
  }
};

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    seedIfEmpty();
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- ROUTES ---

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

// ترحيل فاتورة مبيعات (POS)
app.post('/api/invoices', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { customerName, items, totalWeight, totalAmount } = req.body;
    let account = await Account.findOne({ name: customerName }).session(session);
    if (!account) {
      account = new Account({ name: customerName, type: 'customer', balance: 0 });
      await account.save({ session });
    }
    for (const item of items) {
      let product = await Inventory.findOne({ name: item.name }).session(session);
      if (!product) {
        product = new Inventory({ name: item.name, quantity: 0, sellingPrice: item.unitPrice, unit: 'كغم' });
        await product.save({ session });
      }
      product.quantity -= (item.weight - item.boxWeight);
      await product.save({ session });
      item.productId = product._id;
    }
    const invoice = new Invoice({ accountId: account._id, customerName: account.name, items, totalWeight, totalAmount });
    await invoice.save({ session });
    account.balance += totalAmount;
    account.transactions.push({
      description: `فاتورة بيع #${invoice._id.toString().slice(-6)}`,
      debit: totalAmount, credit: 0, runningBalance: account.balance
    });
    await account.save({ session });
    await session.commitTransaction();
    res.status(201).json({ success: true, invoice });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally { session.endSession(); }
});

// --- NEW: ترحيل فاتورة مشتريات من مورد ---
app.post('/api/purchases', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { supplierName, items, totalWeight, totalAmount } = req.body;

    // 1. معالجة المورد (إنشاء إذا لم يوجد)
    let account = await Account.findOne({ name: supplierName }).session(session);
    if (!account) {
      account = new Account({ name: supplierName, type: 'supplier', balance: 0 });
      await account.save({ session });
    }

    // 2. تحديث المخزن (زيادة الكميات)
    for (const item of items) {
      let product = await Inventory.findOne({ name: item.name }).session(session);
      if (!product) {
        product = new Inventory({ name: item.name, quantity: 0, costPrice: item.unitPrice, unit: 'كغم' });
        await product.save({ session });
      }
      
      const netWeight = item.weight - item.boxWeight;
      product.quantity += netWeight; // زيادة المخزن
      product.costPrice = item.unitPrice; // تحديث سعر التكلفة
      await product.save({ session });
    }

    // 3. تحديث حساب المورد (زيادة ما نطلبه منه أو نقص دينه - هنا المورد له مال علينا)
    // في نظامنا: الرصيد الموجب = دين على الشخص، السالب = نحن مديونون له
    account.balance -= totalAmount; 
    account.transactions.push({
      description: `فاتورة شراء بضاعة واردة`,
      debit: 0,
      credit: totalAmount,
      runningBalance: account.balance
    });
    await account.save({ session });

    await session.commitTransaction();
    res.status(201).json({ success: true, message: "تم تسجيل بضاعة المورد وتحديث المخزن بنجاح" });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

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
      debit: 0, credit: amount, runningBalance: account.balance
    });
    await account.save({ session });
    await session.commitTransaction();
    res.json({ success: true, newBalance: account.balance });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally { session.endSession(); }
});

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
    const todaySales = await Invoice.aggregate([{ $match: { date: { $gte: startOfDay } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]);
    const totalDebts = await Account.aggregate([{ $match: { type: 'customer' } }, { $group: { _id: null, total: { $sum: "$balance" } } }]);
    const lowStock = await Inventory.countDocuments({ $expr: { $lte: ["$quantity", "$minLimit"] } });
    const accounts = await Account.find({ "transactions.date": { $gte: startOfDay } });
    let cashToday = 0;
    accounts.forEach(acc => acc.transactions.forEach(t => { if (t.date >= startOfDay && t.credit > 0) cashToday += t.credit; }));
    res.json({ todaySales: todaySales[0]?.total || 0, totalDebts: totalDebts[0]?.total || 0, lowStockCount: lowStock, cashReceivedToday: cashToday });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
