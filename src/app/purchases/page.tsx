"use client";
import React, { useState, useEffect, useTransition } from "react";
import { Plus, Trash2, FileText, Calculator, Loader2, User, Package, Search, AlertCircle, Sparkles, PlusCircle, X, ShoppingBag } from "lucide-react";
import { api, fetchApi } from "@/lib/api";

interface PurchaseItem {
  name: string;
  weight: number;
  boxWeight: number;
  unitPrice: number;
}

const QUICK_CATALOG = [
  "بندورة", "خيار", "بطاطا", "بصل", "ليمون", "تفاح", "موز", "برتقال", "باذنجان", "فلفل حار", "ثوم"
];

export default function PurchasesPage() {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [isPending, startTransition] = useTransition();
  
  // بيانات قاعدة البيانات
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [availableAccounts, setAvailableAccounts] = useState<any[]>([]);
  
  // التحكم في نافذة إضافة صنف جديد للمحل
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductUnit, setNewProductUnit] = useState("كغم");
  const [newProductPrice, setNewProductPrice] = useState("");

  // مدخلات الفاتورة الحالية
  const [supplierName, setSupplierName] = useState("");
  const [itemName, setItemName] = useState("");
  const [weight, setWeight] = useState("");
  const [boxWeight, setBoxWeight] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  const loadInitialData = async () => {
    try {
      const [prodData, accData] = await Promise.all([
        api.getInventory(),
        api.getAccounts()
      ]);
      setAvailableProducts(prodData);
      setAvailableAccounts(accData.filter((a: any) => a.type === 'supplier'));
    } catch (err) {
      console.error("Failed to load Purchase data", err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleQuickAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) return;
    try {
      await fetchApi("/inventory", {
        method: "POST",
        body: JSON.stringify({
          name: newProductName,
          quantity: 0,
          unit: newProductUnit,
          costPrice: parseFloat(newProductPrice),
          sellingPrice: parseFloat(newProductPrice) * 1.2 // هامش ربح افتراضي 20%
        })
      });
      alert(`✅ تمت إضافة ${newProductName} للمخزن بنجاح!`);
      await loadInitialData();
      setItemName(newProductName);
      setUnitPrice(newProductPrice);
      setShowQuickAdd(false);
      setNewProductName("");
    } catch (err: any) { alert(err.message); }
  };

  const handleSelectProduct = (name: string) => {
    setItemName(name);
    const prod = availableProducts.find(p => p.name === name);
    if (prod) setUnitPrice(prod.costPrice.toString());
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !weight || !unitPrice) return;
    const newItem: PurchaseItem = {
      name: itemName,
      weight: parseFloat(weight),
      boxWeight: boxWeight ? parseFloat(boxWeight) : 0,
      unitPrice: parseFloat(unitPrice),
    };
    setItems((prev) => [...prev, newItem]);
    setItemName(""); setWeight(""); setBoxWeight(""); setUnitPrice("");
  };

  const handleSavePurchase = async () => {
    if (!supplierName.trim()) return alert("يرجى كتابة اسم المورد");
    if (items.length === 0) return alert("الفاتورة فارغة");

    startTransition(async () => {
      try {
        const totalWeight = items.reduce((sum, i) => sum + (i.weight - i.boxWeight), 0);
        const totalAmount = items.reduce((sum, i) => sum + ((i.weight - i.boxWeight) * i.unitPrice), 0);

        const result = await api.createPurchase({
          supplierName,
          items: items.map(i => ({ ...i, total: (i.weight - i.boxWeight) * i.unitPrice })),
          totalWeight,
          totalAmount
        });

        if (result.success) {
          alert("✅ تم ترحيل فاتورة المشتريات بنجاح وتحديث المخزن والحسابات!");
          setItems([]);
          setSupplierName("");
          await loadInitialData();
        }
      } catch (err: any) { alert(err.message); }
    });
  };

  const calculateTotals = () => {
    let weightSum = 0; let amountSum = 0;
    items.forEach((item) => {
      const net = item.weight - item.boxWeight;
      weightSum += net; amountSum += net * item.unitPrice;
    });
    return { weightSum, amountSum };
  };

  const { weightSum, amountSum } = calculateTotals();
  const isNewSupplier = supplierName && !availableAccounts.some(a => a.name === supplierName);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* نافذة إضافة صنف جديد للمخزن */}
      {showQuickAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-white/10 shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2"><PlusCircle className="text-amber-500" /> إضافة صنف للمخزن</h2>
              <button onClick={() => setShowQuickAdd(false)} className="text-slate-500 hover:text-white p-2"><X /></button>
            </div>
            <form onSubmit={handleQuickAddProduct} className="space-y-4">
              <input required placeholder="اسم الصنف الجديد" value={newProductName} onChange={e => setNewProductName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white" />
              <div className="grid grid-cols-2 gap-3">
                <select value={newProductUnit} onChange={e => setNewProductUnit(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"><option value="كغم">كغم</option><option value="صندوق">صندوق</option></select>
                <input required type="number" placeholder="سعر التكلفة" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white" />
              </div>
              <button type="submit" className="w-full py-4 bg-amber-600 rounded-2xl font-black text-white shadow-lg">حفظ وتثبيت الصنف</button>
            </form>
          </div>
        </div>
      )}

      {/* هيدر الصفحة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-white/5 gap-4 card-lifted shadow-2xl">
        <h1 className="text-2xl font-black text-amber-400 flex items-center gap-3"><ShoppingBag className="w-8 h-8" /> فاتورة مشتريات (وارد مورد)</h1>
        <button onClick={handleSavePurchase} disabled={isPending} className="w-full sm:w-auto px-10 py-4 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg group">
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />}
          ترحيل بضاعة المورد
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 space-y-4">
          
          {/* حقل المورد الذكي */}
          <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 card-lifted">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><User className="w-4 h-4 text-amber-500" /> اسم المورد / المزارع</label>
            <input
              list="suppliers-list" type="text" value={supplierName} onChange={(e) => setSupplierName(e.target.value)}
              placeholder="ابحث أو اكتب اسم المورد..."
              className={`w-full bg-slate-950/50 border ${isNewSupplier ? 'border-amber-500/50 ring-2 ring-amber-500/10' : 'border-slate-700'} rounded-2xl px-5 py-4 text-slate-100 focus:outline-none transition-all font-bold`}
            />
            <datalist id="suppliers-list">
              {availableAccounts.map((acc) => <option key={acc._id} value={acc.name}>{acc.balance} ₪ رصيد</option>)}
            </datalist>
            {isNewSupplier && supplierName && (
              <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-[11px] text-amber-400 font-black">سيتم إنشاء حساب مورد جديد</span>
              </div>
            )}
          </div>

          {/* إضافة الأصناف */}
          <form onSubmit={handleAddItem} className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 space-y-5 card-lifted">
            <div className="flex justify-between items-center border-b border-slate-700/50 pb-3 mb-2">
              <h3 className="text-sm font-black text-slate-200 flex items-center gap-2"><Package className="w-4 h-4 text-amber-400" /> إضافة بضاعة واردة</h3>
              <button type="button" onClick={() => setShowQuickAdd(true)} className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all">+ صنف جديد</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {QUICK_CATALOG.map(cat => (
                  <button key={cat} type="button" onClick={() => handleSelectProduct(cat)} className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-400 hover:bg-amber-600 hover:text-white transition-all">{cat}</button>
                ))}
              </div>

              <input
                list="products-list" type="text" required placeholder="ابحث أو اختر صنفاً..." value={itemName}
                onChange={(e) => handleSelectProduct(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl px-5 py-4 text-slate-100 text-sm focus:outline-none font-bold"
              />
              <datalist id="products-list">
                {availableProducts.map((p) => <option key={p._id} value={p.name}>{p.quantity} {p.unit} متاح حالياً</option>)}
              </datalist>

              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" required placeholder="الوزن القائم" value={weight} onChange={(e) => setWeight(e.target.value)} className="bg-slate-950/50 border border-slate-700 rounded-2xl px-5 py-4 text-slate-100 text-lg focus:outline-none font-mono" />
                <input type="number" step="0.01" placeholder="الوزن الفارغ" value={boxWeight} onChange={(e) => setBoxWeight(e.target.value)} className="bg-slate-950/50 border border-slate-700 rounded-2xl px-5 py-4 text-slate-400 text-lg focus:outline-none font-mono" />
              </div>
              <input type="number" step="0.01" required placeholder="سعر الشراء (₪)" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl px-5 py-4 text-amber-400 font-black text-2xl focus:outline-none font-mono tracking-tighter" />
            </div>

            <button type="submit" className="w-full py-5 bg-slate-700/50 hover:bg-slate-700 text-amber-400 rounded-2xl font-black text-sm border border-amber-500/20 transition-all flex items-center justify-center gap-2 shadow-xl hover:-translate-y-0.5">
              <Plus className="w-6 h-6" /> إدراج في الفاتورة
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 flex flex-col justify-between bg-slate-800/40 rounded-3xl border border-slate-700/50 p-8 min-h-[550px] card-lifted shadow-xl overflow-hidden relative">
          <div className="overflow-x-auto w-full relative z-10">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]"><th className="pb-6">الصنف الوارد</th><th className="pb-6 text-center">الصافي</th><th className="pb-6 text-center">السعر</th><th className="pb-6 text-left">المجموع</th><th className="pb-6 w-10"></th></tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30 text-sm">
                {items.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-32 text-slate-600 font-black italic tracking-widest opacity-20 uppercase">بانتظار إضافة بضاعة المورد...</td></tr>
                ) : (
                  items.map((item, idx) => {
                    const net = item.weight - item.boxWeight; const total = net * item.unitPrice;
                    return (
                      <tr key={idx} className="group hover:bg-slate-700/20 transition-colors">
                        <td className="py-5 font-black text-slate-200 text-lg">{item.name}</td>
                        <td className="py-5 text-center"><span className="bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-xl font-mono font-black text-lg border border-amber-500/10">{net.toFixed(2)} كغم</span></td>
                        <td className="py-5 text-center text-slate-400 font-mono font-bold">{item.unitPrice} ₪</td>
                        <td className="py-5 text-left font-black text-slate-100 text-xl tracking-tighter">{total.toFixed(2)} ₪</td>
                        <td className="py-5 text-left">
                          <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-slate-600 hover:text-rose-500 p-2 transition-all hover:rotate-12"><Trash2 className="w-5 h-5" /></button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-700/50 pt-8 mt-8 grid grid-cols-2 gap-8 bg-slate-950/40 p-8 rounded-3xl relative z-10">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">إجمالي الأوزان الواردة</p>
              <p className="text-3xl font-black text-slate-200 font-mono tracking-tighter">{weightSum.toFixed(2)} <span className="text-sm font-bold text-slate-600">كغم</span></p>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">إجمالي مستحقات المورد</p>
              <p className="text-5xl font-black text-amber-400 font-mono tracking-tighter">
                {amountSum.toFixed(2)} <span className="text-2xl font-bold text-amber-600">₪</span>
              </p>
            </div>
          </div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-slate-900 rounded-full blur-[80px] opacity-50"></div>
        </div>
      </div>
    </div>
  );
}
