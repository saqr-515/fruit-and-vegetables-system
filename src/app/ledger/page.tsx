"use client";
import React, { useEffect, useState } from "react";
import { BookOpen, Search, Printer, UserCheck, ArrowUpRight, ArrowDownRight, Phone, Loader2, Plus, X, Calendar } from "lucide-react";
import { api, fetchApi } from "@/lib/api";

interface Transaction {
  date: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

interface Account {
  _id: string;
  name: string;
  phone: string;
  type: 'customer' | 'supplier';
  balance: number;
  transactions: Transaction[];
}

export default function LedgerPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newType, setNewType] = useState<'customer' | 'supplier'>('customer');

  const loadAccounts = async () => {
    try {
      const data = await api.getAccounts();
      setAccounts(data);
    } catch (err) {
      console.error("Failed to load accounts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi("/accounts", {
        method: "POST",
        body: JSON.stringify({ name: newName, phone: newPhone, type: newType })
      });
      setShowAddAccount(false);
      setNewName("");
      setNewPhone("");
      loadAccounts();
    } catch (err: any) { alert(err.message); }
  };

  const filteredAccounts = accounts.filter(c => 
    c.name.includes(searchTerm) || (c.phone && c.phone.includes(searchTerm))
  );

  const totalMarketDebts = accounts.reduce((sum, c) => sum + (c.type === 'customer' ? c.balance : 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {/* هيدر الشاشة */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl border border-white/5 gap-6 card-lifted shadow-2xl">
        <div>
          <h1 className="text-2xl font-black text-emerald-400 flex items-center gap-3">
            <BookOpen className="w-8 h-8" /> دفتر ذمم الحسابات والديون
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">إدارة كاملة لحسابات "الحسبة" ومطابقة الديون والتحصيل.</p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 px-8 py-4 rounded-2xl glow-rose">
          <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest">إجمالي ديون السوق</p>
          <p className="text-3xl font-black text-rose-400 mt-1 font-mono">{totalMarketDebts.toLocaleString()} ₪</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex items-center gap-4 card-lifted shadow-lg">
          <Search className="w-6 h-6 text-slate-500 shrink-0" />
          <input 
            type="text" placeholder="ابحث عن تاجر..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none text-slate-100 font-medium placeholder:text-slate-600"
          />
        </div>
        <button onClick={() => setShowAddAccount(!showAddAccount)} className="px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg glow-emerald transition-all">
          <Plus className="w-5 h-5" /> إضافة حساب
        </button>
      </div>

      {showAddAccount && (
        <form onSubmit={handleAddAccount} className="bg-slate-800/60 p-6 rounded-3xl border border-emerald-500/20 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4">
          <input required placeholder="الاسم" value={newName} onChange={e => setNewName(e.target.value)} className="bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white" />
          <input placeholder="الجوال" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white" />
          <select value={newType} onChange={e => setNewType(e.target.value as any)} className="bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white">
            <option value="customer">زبون (مشتري)</option>
            <option value="supplier">مورد (مزارع)</option>
          </select>
          <button type="submit" className="bg-emerald-600 rounded-xl font-bold text-sm">تأكيد الإضافة</button>
        </form>
      )}

      {/* جدول الحسابات */}
      <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 overflow-hidden card-lifted shadow-xl">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-900/40 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <th className="p-5">التاجر</th>
              <th className="p-5 text-center">الرصيد النهائي</th>
              <th className="p-5 text-center">الإجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {filteredAccounts.map((acc) => (
              <tr key={acc._id} className="group hover:bg-slate-700/20 transition-colors">
                <td className="p-5 cursor-pointer" onClick={() => setSelectedAccount(acc)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center font-black text-emerald-400 border border-slate-700">{acc.name[0]}</div>
                    <div>
                      <p className="font-black text-slate-200 group-hover:text-emerald-400 transition-colors">{acc.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{acc.phone || 'بدون هاتف'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-5 text-center">
                  <span className={`px-4 py-1.5 rounded-xl font-black text-sm border ${acc.balance > 0 ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : acc.balance < 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-700 text-slate-500 border-slate-600"}`}>
                    {Math.abs(acc.balance).toLocaleString()} {acc.balance > 0 ? 'دين' : acc.balance < 0 ? 'له' : 'خالص'}
                  </span>
                </td>
                <td className="p-5 text-center">
                  <button onClick={() => setSelectedAccount(acc)} className="text-[10px] font-black text-slate-500 hover:text-emerald-400 uppercase tracking-tighter">كشف حساب</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* كشف الحساب المفصل (Modal) */}
      {selectedAccount && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-800/50">
              <div>
                <h2 className="text-xl font-black text-white">كشف حساب مفصل: {selectedAccount.name}</h2>
                <p className="text-xs text-slate-500 mt-1 font-mono">آخر رصيد: {selectedAccount.balance} ₪</p>
              </div>
              <button onClick={() => setSelectedAccount(null)} className="p-2 bg-slate-700/50 hover:bg-rose-500/20 hover:text-rose-500 rounded-xl transition-all"><X /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <table className="w-full text-right">
                <thead>
                  <tr className="text-[10px] font-black text-slate-500 uppercase border-b border-white/5 pb-4">
                    <th className="pb-4">التاريخ</th>
                    <th className="pb-4">البيان</th>
                    <th className="pb-4 text-center">سحب (مدين)</th>
                    <th className="pb-4 text-center">واصل (دائن)</th>
                    <th className="pb-4 text-left">الرصيد</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-white/5">
                  {selectedAccount.transactions.map((t, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 text-slate-500 font-mono text-xs">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="py-4 font-bold text-slate-300">{t.description}</td>
                      <td className="py-4 text-center text-rose-400 font-bold">{t.debit > 0 ? t.debit.toLocaleString() : '---'}</td>
                      <td className="py-4 text-center text-emerald-400 font-bold">{t.credit > 0 ? t.credit.toLocaleString() : '---'}</td>
                      <td className="py-4 text-left font-black text-white">{t.runningBalance.toLocaleString()} ₪</td>
                    </tr>
                  ))}
                  {selectedAccount.transactions.length === 0 && (
                    <tr><td colSpan={5} className="py-20 text-center text-slate-600">لا يوجد سجل معاملات حالياً.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-slate-800/50 border-t border-white/5 flex justify-end gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-black transition-all">
                <Printer className="w-4 h-4" /> طباعة كشف مفصل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
