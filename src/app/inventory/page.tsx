"use client";
import React, { useState, useEffect, useTransition } from "react";
import { Package, Plus, AlertTriangle, CheckCircle, RefreshCw, Search, Box, Loader2, DollarSign } from "lucide-react";
import { api, fetchApi } from "@/lib/api";

interface InventoryItem {
  _id: string;
  name: string;
  quantity: number;
  minLimit: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  lastUpdated: string;
}

export default function InventoryPage() {
  const [stock, setStock] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");

  // مدخلات الصنف الجديد
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minLimit, setMinLimit] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [unit, setUnit] = useState("كغم");

  const loadStock = async () => {
    try {
      const data = await api.getInventory();
      setStock(data);
    } catch (err) {
      console.error("Failed to load inventory", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  const handleAddToInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !quantity) return;

    startTransition(async () => {
      try {
        await fetchApi("/inventory", {
          method: "POST",
          body: JSON.stringify({
            name: itemName,
            quantity: parseFloat(quantity),
            minLimit: parseFloat(minLimit || "0"),
            costPrice: parseFloat(costPrice || "0"),
            sellingPrice: parseFloat(sellingPrice || "0"),
            unit
          })
        });
        
        await loadStock();
        setItemName("");
        setQuantity("");
        setMinLimit("");
        setCostPrice("");
        setSellingPrice("");
        alert("تمت إضافة الصنف للمخزن بنجاح!");
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  const filteredStock = stock.filter(item => item.name.includes(searchTerm));

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* هيدر الصفحة الفاخر */}
      <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl border border-white/5 shadow-2xl card-lifted relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-black text-amber-400 flex items-center gap-3">
            <Package className="w-8 h-8" /> مستودع وجرد بضاعة المحل
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium tracking-wide">التحكم الكامل في الكميات، التكاليف، وأسعار البيع في الحسبة.</p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* نموذج الإضافة المطور */}
        <div className="lg:col-span-1">
          <form onSubmit={handleAddToInventory} className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 space-y-5 card-lifted">
            <h3 className="text-sm font-black text-slate-200 border-b border-slate-700/50 pb-3 mb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" /> تعريف صنف / بضاعة جديدة
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">اسم الصنف</label>
                <input 
                  type="text" required placeholder="مثال: ليمون إفريقي"
                  value={itemName} onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">الكمية الافتتاحية</label>
                  <input 
                    type="number" step="0.01" required placeholder="0.00"
                    value={quantity} onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">الوحدة</label>
                  <select 
                    value={unit} onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none text-sm appearance-none cursor-pointer"
                  >
                    <option value="كغم">كيلو جرام</option>
                    <option value="صندوق">صندوق/سحارة</option>
                    <option value="طن">طن</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">سعر التكلفة (₪)</label>
                  <input 
                    type="number" step="0.01" placeholder="0.00"
                    value={costPrice} onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-rose-400 font-bold focus:outline-none text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">سعر البيع (₪)</label>
                  <input 
                    type="number" step="0.01" placeholder="0.00"
                    value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-emerald-400 font-bold focus:outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">حد الأمان (للتنبيه)</label>
                <input 
                  type="number" step="0.01" placeholder="نبهني عند الوصول لـ..."
                  value={minLimit} onChange={(e) => setMinLimit(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-amber-500 font-bold focus:outline-none text-sm transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-slate-700/50 hover:bg-slate-700 text-amber-400 rounded-xl font-black text-sm border border-amber-500/20 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
              تسجيل الصنف في المخزن
            </button>
          </form>
        </div>

        {/* عرض جدول الجرد المطور */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex items-center gap-4 card-lifted group">
            <Search className="w-6 h-6 text-slate-500 transition-colors group-focus-within:text-amber-500" />
            <input 
              type="text" 
              placeholder="ابحث عن صنف بالاسم..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-slate-100 font-medium placeholder:text-slate-600 w-full"
            />
          </div>

          <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 min-h-[500px] card-lifted shadow-xl relative overflow-hidden">
            <div className="overflow-x-auto w-full relative z-10">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-700/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <th className="pb-4">الصنف</th>
                    <th className="pb-4 text-center">الرصيد</th>
                    <th className="pb-4 text-center">سعر البيع</th>
                    <th className="pb-4 text-center">الحالة</th>
                    <th className="pb-4 text-left">التكلفة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30 text-sm">
                  {filteredStock.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-32 text-slate-600 font-medium italic">المخزن فارغ حالياً...</td></tr>
                  ) : (
                    filteredStock.map((item) => {
                      const isLow = item.quantity <= item.minLimit;
                      return (
                        <tr key={item._id} className="group hover:bg-slate-700/20 transition-colors">
                          <td className="py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-900/50 flex items-center justify-center text-amber-500 border border-slate-700/50">
                                <Box className="w-5 h-5" />
                              </div>
                              <p className="font-black text-slate-200">{item.name}</p>
                            </div>
                          </td>
                          <td className="py-5 text-center">
                            <span className={`font-mono font-black text-xl ${isLow ? 'text-rose-400' : 'text-slate-100'}`}>
                              {item.quantity.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-500 mr-1 font-bold">{item.unit}</span>
                          </td>
                          <td className="py-5 text-center">
                            <span className="text-emerald-400 font-black font-mono text-lg">{item.sellingPrice} ₪</span>
                          </td>
                          <td className="py-5 text-center">
                            {isLow ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse glow-rose">
                                <AlertTriangle className="w-3.5 h-3.5" /> ناقص
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle className="w-3.5 h-3.5" /> كافٍ
                              </span>
                            )}
                          </td>
                          <td className="py-5 text-left text-rose-400/50 font-mono text-xs">{item.costPrice} ₪</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {/* زخرفة خلفية للجدول */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
