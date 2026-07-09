"use client";
import React, { useEffect, useState } from "react";
import { TrendingUp, Users, ArrowDownRight, PackageCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    todaySales: 0,
    totalDebts: 0,
    cashReceivedToday: 0,
    lowStockCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* هيدر ترحيبي فاخر */}
      <div className="relative overflow-hidden bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl card-lifted">
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-white tracking-tight">
            مرحباً بك في نظام <span className="text-emerald-400">صقر</span> السحابي 👋
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium max-w-md leading-relaxed">
            إليك نظرة فنية شاملة على حركة المبيعات، المخزون، والديون القائمة في الحسبة اليوم.
          </p>
        </div>
        {/* زينة خلفية */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* كروت الإحصائيات السريعة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 card-lifted group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 glow-emerald transition-transform group-hover:scale-110">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">مبيعات اليوم</span>
          </div>
          <p className="text-3xl font-black text-white font-mono">{stats.todaySales.toLocaleString()} <span className="text-sm text-slate-500">₪</span></p>
        </div>

        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 card-lifted group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 glow-rose transition-transform group-hover:scale-110">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">إجمالي الديون</span>
          </div>
          <p className="text-3xl font-black text-white font-mono">{stats.totalDebts.toLocaleString()} <span className="text-sm text-slate-500">₪</span></p>
        </div>

        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 card-lifted group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 transition-transform group-hover:scale-110">
              <ArrowDownRight className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">الكاش المحصل</span>
          </div>
          <p className="text-3xl font-black text-white font-mono">{stats.cashReceivedToday.toLocaleString()} <span className="text-sm text-slate-500">₪</span></p>
        </div>

        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 card-lifted group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 transition-transform group-hover:scale-110">
              <PackageCheck className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">تنبيه المخزن</span>
          </div>
          <p className="text-3xl font-black text-white font-mono">{stats.lowStockCount} <span className="text-sm text-slate-500">أصناف</span></p>
        </div>

      </div>

      {/* أزرار الوصول السريع */}
      <div className="bg-slate-800/30 p-8 rounded-3xl border border-slate-700/50">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          إجراءات سريعة في الميدان
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/pos" className="group p-6 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-center transition-all shadow-xl hover:-translate-y-1 glow-emerald">
            <span className="block text-2xl mb-2 group-hover:scale-125 transition-transform">➕</span>
            <span className="text-sm font-black text-white">فاتورة بيع</span>
          </Link>
          <Link href="/receipts" className="group p-6 bg-blue-600 hover:bg-blue-500 rounded-2xl text-center transition-all shadow-xl hover:-translate-y-1">
            <span className="block text-2xl mb-2 group-hover:scale-125 transition-transform">💵</span>
            <span className="text-sm font-black text-white">قبض كاش</span>
          </Link>
          <Link href="/ledger" className="group p-6 bg-slate-700 hover:bg-slate-600 rounded-2xl text-center transition-all shadow-xl hover:-translate-y-1">
            <span className="block text-2xl mb-2 group-hover:scale-125 transition-transform">📖</span>
            <span className="text-sm font-black text-white">الديون</span>
          </Link>
          <Link href="/inventory" className="group p-6 bg-amber-600 hover:bg-amber-500 rounded-2xl text-center transition-all shadow-xl hover:-translate-y-1">
            <span className="block text-2xl mb-2 group-hover:scale-125 transition-transform">📦</span>
            <span className="text-sm font-black text-white">المخزن</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
