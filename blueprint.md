# Blueprint - نظام صقر لإدارة الحسبة (Full-Stack Migration)

## نظرة عامة
تحويل النظام من واجهات ثابتة إلى نظام Full-Stack متكامل يعتمد على Node.js و MongoDB، مع فصل كامل عن بيئة Firebase.

## الهيكلية التقنية (Tech Stack)
- **Frontend:** Next.js (App Router) + Tailwind CSS 4.
- **Backend:** Node.js + Express.js (Standalone Server).
- **Database:** MongoDB Atlas (NoSQL) لإدارة الحسابات المرنة.
- **API Design:** RESTful API مع دعم للمعاملات (Transactions) لضمان دقة البيانات المالية.

## المميزات الفنية المحققة
- [x] **Backend Skeleton:** خادم Express مع حماية CORS وتنسيق JSON.
- [x] **Database Models:** 
    - `Account`: لإدارة ديون الزبائن والموردين وتاريخ المعاملات.
    - `Inventory`: لإدارة رصيد المخزن والأسعار.
    - `Invoice`: لتوثيق فواتير البيع وتفاصيل الأصناف.
- [x] **Transaction Sync:** ربط تلقائي (عند حفظ الفاتورة -> ينقص المخزن -> يزيد دين الزبون).

## الخطوات الحالية (Current Tasks)
- [ ] إنشاء طبقة التواصل `src/lib/api.ts` في الفرونت آند.
- [ ] ربط شاشة الـ POS لإرسال البيانات الحقيقية للباكيند.
- [ ] تحديث الداشبورد ليعكس إحصائيات MongoDB (المبيعات، الديون، النواقص).
- [ ] ربط شاشة المخزن لإدارة الأصناف ديناميكياً.

## كيفية التشغيل (Local Execution)
1. **الباكيند:** `cd backend && npm install && npm run dev` (يعمل على منفذ 5000).
2. **الفرونت آند:** يعمل بشكل طبيعي عبر Next.js Dev Server.
