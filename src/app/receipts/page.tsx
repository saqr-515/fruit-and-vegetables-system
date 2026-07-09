"use client";
import React, { useState, useEffect, useTransition } from "react";
import { Wallet, Plus, Printer, User, DollarSign, Loader2, Search } from "lucide-react";
import { api } from "@/lib/api";

interface Receipt {
  _id: string;
  customerName: string;
  amount: number;
  date: string;
  notes: string;
}

export default function ReceiptsPage() {
  const [customerName, setCustomerName] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const accData = await api.getAccounts();
        setAccounts(accData.filter((a: any) => a.type === 'customer'));
        // ملاحظة: يمكن إضافة API لجلب آخر السندات لاحقاً، هنا نكتفي بالتحميل الأولي للحسابات
      } catch (err) {
        console.error("Failed to load accounts", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId || !amount) return;

    startTransition(async () => {
      try {
        const result = await api.createPayment({
          accountId: selectedAccountId,
          amount: parseFloat(amount),
          notes: notes || "دفعة نقدية واصل"
        });
        
        if (result.success) {
          alert(`تم ترحيل المبلغ ${amount} ₪ وتحديث رصيد الزبون.`);
          setAmount("");
          setNotes("");
          setSelectedAccountId("");
          // تحديث قائمة السندات محلياً للعرض
          const acc = accounts.find(a => a._id === selectedAccountId);
          const newR = {
            _id: Math.random().toString(),
            customerName: acc?.name || "زبون",
            amount: parseFloat(amount),
            date: new Date().toISOString(),
            notes: notes
          };
          setReceipts([newR, ...receipts]);
        }
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  const handlePrintReceipt = (receipt: Receipt) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>سند قبض - ${receipt._id}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { font-family: Arial, sans-serif; width: 76mm; margin: 2mm; direction: rtl; text-align: right; font-size: 12px; color: #000; }
            .title { text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 5px; }
            .subtitle { text-align: center; font-size: 11px; margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
            .row { display: flex; justify-content: space-between; margin: 5px 0; }
            .amount-box { text-align: center; font-size: 16px; font-weight: bold; border: 1px dashed #000; padding: 5px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="title">🍉 نظام صقر للجملة</div>
          <div class="subtitle">وصل / سند قبض نقدي</div>
          <div class="row"><span>التاريخ:</span> <span>${new Date(receipt.date).toLocaleDateString()}</span></div>
          <div class="row"><span>استلمنا من:</span> <b>${receipt.customerName}</b></div>
          <div class="amount-box">المبلغ: ${receipt.amount.toFixed(2)} ₪</div>
          <div class="row"><span>البيان:</span> <span>${receipt.notes}</span></div>
          <div class="footer">شكراً لثقتكم بنا<br>نظام صقر لإدارة الحسبة</div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-3xl border border-white/5 card-lifted shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-black text-blue-400 flex items-center gap-3">
            <Wallet className="w-8 h-8" /> حركة السندات والقبض النقدي
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">تسجيل الدفعات النقدية الواردة وتصفير ديون الزبائن فورياً.</p>
        </div>
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* نموذج إضافة السند */}
        <div className="lg:col-span-1">
          <form onSubmit={handleCreateReceipt} className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 space-y-6 card-lifted shadow-xl">
            <h3 className="text-sm font-black text-slate-200 border-b border-slate-700/50 pb-3 flex items-center gap-2">
              💵 إنشاء سند قبض جديد
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> اسم الزبون الواصل
                </label>
                <select 
                  required value={selectedAccountId} 
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all appearance-none cursor-pointer"
                >
                  <option value="">-- اختر الزبون --</option>
                  {accounts.map(acc => (
                    <option key={acc._id} value={acc._id}>{acc.name} (الدين: {acc.balance} ₪)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> المبلغ المستلم (₪)
                </label>
                <input 
                  type="number" step="0.01" required placeholder="0.00"
                  value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-emerald-400 font-black text-2xl focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">البيان / ملاحظات</label>
                <textarea 
                  placeholder="مثال: دفعة تحت الحساب..."
                  value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 text-sm h-28 resize-none focus:outline-none transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg glow-blue"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              ترحيل السند المالي
            </button>
          </form>
        </div>

        {/* عرض آخر السندات */}
        <div className="lg:col-span-2 bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 min-h-[450px] card-lifted shadow-xl relative overflow-hidden">
          <div className="overflow-x-auto w-full relative z-10">
            <h3 className="text-sm font-black text-slate-200 mb-6 flex items-center gap-2">
               آخر المقبوضات المسجلة الآن
            </h3>
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <th className="pb-4">رقم السند</th>
                  <th className="pb-4">اسم التاجر</th>
                  <th className="pb-4 text-center">التاريخ</th>
                  <th className="pb-4 text-center">المبلغ</th>
                  <th className="pb-4 w-20 text-center">وصل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30 text-sm">
                {receipts.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-32 text-slate-600 font-medium italic">لم يتم تسجيل سندات في الجلسة الحالية...</td></tr>
                ) : (
                  receipts.map((r) => (
                    <tr key={r._id} className="group hover:bg-slate-700/20 transition-colors">
                      <td className="py-5 font-mono text-slate-500 text-xs">#{r._id.slice(-5)}</td>
                      <td className="py-5 font-black text-slate-200">{r.customerName}</td>
                      <td className="py-5 text-center text-slate-400 font-mono text-xs">{new Date(r.date).toLocaleString()}</td>
                      <td className="py-5 text-center text-emerald-400 font-black text-xl">{r.amount} ₪</td>
                      <td className="py-5 text-center">
                        <button
                          onClick={() => handlePrintReceipt(r)}
                          className="p-3 bg-slate-700/50 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-600/50 shadow-lg"
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
