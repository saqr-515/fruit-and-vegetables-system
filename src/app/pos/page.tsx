"use client";
import React, { useState, useEffect, useTransition } from "react";
import { Plus, Trash2, FileText, Calculator, Loader2, Search, User, Package } from "lucide-react";
import { api } from "@/lib/api";

interface InvoiceItem {
  productId: string;
  name: string;
  weight: number;
  boxWeight: number;
  unitPrice: number;
}

export default function POSPage() {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [isPending, startTransition] = useTransition();
  
  // بيانات من الباكيند
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  
  // الاختيارات الحالية
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  
  // مدخلات الصنف الحالي
  const [weight, setWeight] = useState("");
  const [boxWeight, setBoxWeight] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [prodData, accData] = await Promise.all([
          api.getInventory(),
          api.getAccounts()
        ]);
        setAvailableProducts(prodData);
        setAccounts(accData.filter((a: any) => a.type === 'customer'));
      } catch (err) {
        console.error("Failed to load POS data", err);
      }
    }
    loadData();
  }, []);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const product = availableProducts.find(p => p._id === selectedProductId);
    if (!product || !weight || !unitPrice) return;

    const newItem: InvoiceItem = {
      productId: product._id,
      name: product.name,
      weight: parseFloat(weight),
      boxWeight: boxWeight ? parseFloat(boxWeight) : 0,
      unitPrice: parseFloat(unitPrice),
    };

    setItems((prev) => [...prev, newItem]);
    setWeight("");
    setBoxWeight("");
    setUnitPrice("");
    setSelectedProductId("");
  };

  const handleSaveInvoice = async () => {
    if (!selectedAccountId) return alert("يرجى اختيار الزبون");
    if (items.length === 0) return alert("الفاتورة فارغة");

    startTransition(async () => {
      try {
        const totalWeight = items.reduce((sum, i) => sum + (i.weight - i.boxWeight), 0);
        const totalAmount = items.reduce((sum, i) => sum + ((i.weight - i.boxWeight) * i.unitPrice), 0);

        const result = await api.createInvoice({
          accountId: selectedAccountId,
          items: items.map(i => ({ ...i, total: (i.weight - i.boxWeight) * i.unitPrice })),
          totalWeight,
          totalAmount
        });

        if (result.success) {
          alert("تم ترحيل الفاتورة بنجاح وتحديث الحسابات والمخزن!");
          setItems([]);
          setSelectedAccountId("");
        }
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  const calculateTotals = () => {
    let totalWeight = 0;
    let totalAmount = 0;
    items.forEach((item) => {
      const netWeight = item.weight - item.boxWeight;
      totalWeight += netWeight;
      totalAmount += netWeight * item.unitPrice;
    });
    return { totalWeight, totalAmount };
  };

  const { totalWeight, totalAmount } = calculateTotals();

  return (
    <div className="space-y-6 p-2 animate-in fade-in duration-500">
      {/* هيدر الفاتورة الفاخر */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-white/5 gap-4 card-lifted shadow-2xl">
        <h1 className="text-2xl font-black text-emerald-400 flex items-center gap-3">
          <Calculator className="w-8 h-8" /> فاتورة مبيعات جملة
        </h1>
        <button
          onClick={handleSaveInvoice}
          disabled={isPending}
          className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 glow-emerald shadow-lg"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
          ترحيل وحفظ الفاتورة
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {/* اختيار الزبون */}
          <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 card-lifted">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <User className="w-3 h-3 text-emerald-500" /> اختيار الزبون / التاجر
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none"
            >
              <option value="">-- اختر زبوناً من القائمة --</option>
              {accounts.map(acc => (
                <option key={acc._id} value={acc._id}>{acc.name} (دين: {acc.balance} ₪)</option>
              ))}
            </select>
          </div>

          {/* إضافة صنف */}
          <form onSubmit={handleAddItem} className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 space-y-4 card-lifted">
            <h3 className="text-sm font-black text-slate-200 border-b border-slate-700/50 pb-3 mb-2 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" /> إضافة صنف للميزان
            </h3>
            
            <div className="space-y-4">
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  const prod = availableProducts.find(p => p._id === e.target.value);
                  if (prod) setUnitPrice(prod.sellingPrice.toString());
                }}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-all"
              >
                <option value="">-- اختر الصنف من المخزن --</option>
                {availableProducts.map(p => (
                  <option key={p._id} value={p._id}>{p.name} (متاح: {p.quantity} {p.unit})</option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number" step="0.01" required placeholder="الوزن القائم"
                  value={weight} onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none"
                />
                <input
                  type="number" step="0.01" placeholder="الوزن الفارغ"
                  value={boxWeight} onChange={(e) => setBoxWeight(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none"
                />
              </div>

              <input
                type="number" step="0.01" required placeholder="سعر الكيلو (₪)"
                value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-emerald-400 font-black text-lg focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-slate-700/50 hover:bg-slate-700 text-emerald-400 rounded-xl font-bold text-sm border border-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> إدراج في الفاتورة
            </button>
          </form>
        </div>

        {/* عرض الجدول */}
        <div className="lg:col-span-2 flex flex-col justify-between bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6 min-h-[450px] card-lifted shadow-xl">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <th className="pb-4">الصنف</th>
                  <th className="pb-4 text-center">الصافي</th>
                  <th className="pb-4 text-center">السعر</th>
                  <th className="pb-4 text-left">المجموع</th>
                  <th className="pb-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30 text-sm">
                {items.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-20 text-slate-600 font-medium italic">بانتظار إضافة الأصناف...</td></tr>
                ) : (
                  items.map((item, idx) => {
                    const net = item.weight - item.boxWeight;
                    const total = net * item.unitPrice;
                    return (
                      <tr key={idx} className="group hover:bg-slate-700/20 transition-colors">
                        <td className="py-4 font-bold text-slate-200">{item.name}</td>
                        <td className="py-4 text-center text-emerald-400 font-mono font-bold">{net.toFixed(2)} كغم</td>
                        <td className="py-4 text-center text-slate-400 font-mono">{item.unitPrice} ₪</td>
                        <td className="py-4 text-left font-black text-slate-100 text-lg">{total.toFixed(2)} ₪</td>
                        <td className="py-4 text-left">
                          <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-slate-600 hover:text-rose-500 p-2 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-700/50 pt-6 mt-6 grid grid-cols-2 gap-6 bg-slate-950/30 p-6 rounded-2xl">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">إجمالي الأوزان</p>
              <p className="text-2xl font-black text-slate-200 font-mono">{totalWeight.toFixed(2)} <span className="text-sm">كغم</span></p>
            </div>
            <div className="text-left space-y-1">
              <p className="text-[10px] font-black text-emerald-500/70 uppercase tracking-tighter">المجموع الكلي</p>
              <p className="text-4xl font-black text-emerald-400 font-mono tracking-tighter">
                {totalAmount.toFixed(2)} <span className="text-xl">₪</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
