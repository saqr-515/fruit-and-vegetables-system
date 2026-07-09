require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');
const Account = require('./models/Account');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // 1. تنظيف البيانات القديمة (اختياري - يفضل عدم مسح المخزون الفعلي في الإنتاج)
    // await Inventory.deleteMany({});
    
    const products = [
      // خضروات
      { name: "بندورة نخب أول", quantity: 1500, unit: "كغم", costPrice: 2.5, sellingPrice: 3.5, minLimit: 300 },
      { name: "بندورة بلدية", quantity: 800, unit: "كغم", costPrice: 1.8, sellingPrice: 2.8, minLimit: 200 },
      { name: "خيار بلدي", quantity: 1200, unit: "كغم", costPrice: 2, sellingPrice: 3, minLimit: 250 },
      { name: "خيار بيوت", quantity: 600, unit: "كغم", costPrice: 1.5, sellingPrice: 2.5, minLimit: 150 },
      { name: "بطاطا زراعية", quantity: 3000, unit: "كغم", costPrice: 1, sellingPrice: 2, minLimit: 500 },
      { name: "بصل أحمر", quantity: 5000, unit: "كغم", costPrice: 0.8, sellingPrice: 1.5, minLimit: 400 },
      { name: "بصل أبيض", quantity: 2000, unit: "كغم", costPrice: 1.2, sellingPrice: 2.2, minLimit: 300 },
      { name: "ثوم صيني", quantity: 500, unit: "كغم", costPrice: 8, sellingPrice: 12, minLimit: 100 },
      { name: "باذنجان عجمي", quantity: 400, unit: "كغم", costPrice: 1.5, sellingPrice: 2.5, minLimit: 100 },
      { name: "فلفل حار", quantity: 300, unit: "كغم", costPrice: 3, sellingPrice: 5, minLimit: 50 },
      { name: "فلفل حلو (ألوان)", quantity: 250, unit: "كغم", costPrice: 5, sellingPrice: 8, minLimit: 50 },
      { name: "زهرة (قرنبيط)", quantity: 1000, unit: "كغم", costPrice: 1.2, sellingPrice: 2.5, minLimit: 200 },
      { name: "ملفوف أحمر", quantity: 400, unit: "كغم", costPrice: 2, sellingPrice: 3.5, minLimit: 100 },
      { name: "كوسا نخب", quantity: 350, unit: "كغم", costPrice: 3, sellingPrice: 4.5, minLimit: 80 },
      { name: "ليمون بلدي", quantity: 1200, unit: "كغم", costPrice: 2.5, sellingPrice: 4, minLimit: 200 },
      
      // فواكه
      { name: "تفاح جولا", quantity: 200, unit: "صندوق", costPrice: 45, sellingPrice: 65, minLimit: 20 },
      { name: "تفاح سميث", quantity: 150, unit: "صندوق", costPrice: 50, sellingPrice: 75, minLimit: 20 },
      { name: "موز أريحا", quantity: 500, unit: "كغم", costPrice: 3, sellingPrice: 4.5, minLimit: 100 },
      { name: "برتقال شموطي", quantity: 1500, unit: "كغم", costPrice: 1.5, sellingPrice: 2.5, minLimit: 200 },
      { name: "عنب خليلي", quantity: 300, unit: "كغم", costPrice: 4, sellingPrice: 7, minLimit: 50 },
      { name: "إجاص (كمثرى)", quantity: 400, unit: "كغم", costPrice: 4, sellingPrice: 6, minLimit: 80 },
      { name: "دراق", quantity: 250, unit: "كغم", costPrice: 5, sellingPrice: 8, minLimit: 40 },
      { name: "كيوي", quantity: 100, unit: "كرتونة", costPrice: 25, sellingPrice: 35, minLimit: 10 }
    ];

    for (const p of products) {
        await Inventory.findOneAndUpdate({ name: p.name }, p, { upsert: true });
    }

    console.log("✅ Database Seeded with expanded Inventory!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedData();
