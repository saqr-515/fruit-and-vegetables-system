require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');
const Account = require('./models/Account');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // 1. مسح البيانات القديمة (اختياري)
    await Inventory.deleteMany({});
    await Account.deleteMany({});

    // 2. إضافة أصناف المخزن
    const products = [
      { name: "بندورة نخب أول", quantity: 1500, unit: "كغم", costPrice: 2.5, sellingPrice: 3.5, minLimit: 300 },
      { name: "خيار بلدي", quantity: 800, unit: "كغم", costPrice: 1.8, sellingPrice: 2.8, minLimit: 200 },
      { name: "بطاطا زراعية", quantity: 2000, unit: "كغم", costPrice: 1.2, sellingPrice: 2.2, minLimit: 500 },
      { name: "بصل أحمر", quantity: 3000, unit: "كغم", costPrice: 0.8, sellingPrice: 1.5, minLimit: 400 },
      { name: "تفاح سكري", quantity: 150, unit: "صندوق", costPrice: 45, sellingPrice: 60, minLimit: 20 }
    ];
    await Inventory.insertMany(products);

    // 3. إضافة زبائن وموردين
    const accounts = [
      { name: "شركة البركة للتوزيع", type: "customer", balance: 5400, phone: "0599000111" },
      { name: "سوبرماركت المدينة", type: "customer", balance: 1250, phone: "0599000222" },
      { name: "المزارع أبو إسماعيل", type: "supplier", balance: -3200, phone: "0599000333" } // بالسالب يعني نطلبه بضاعة
    ];
    await Account.insertMany(accounts);

    console.log("✅ Seeding completed successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedData();
