import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import Link from "next/link";
import { LayoutDashboard, ShoppingCart, BookOpen, Wallet, Package, Zap, ShoppingBag } from "lucide-react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const montserrat = Montserrat({ subsets: ["latin"], weight: ['900'], variable: '--font-montserrat' });

export const metadata: Metadata = {
  title: "SAQR | نظام صقر السحابي",
  description: "نظام إدارة محلات الخضار والفواكه بالجملة - النسخة الاحترافية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <body className={`${inter.variable} ${montserrat.variable} bg-slate-950 text-slate-100 min-h-screen flex flex-col md:flex-row antialiased selection:bg-emerald-500/30`}>
        
        {/* شريط التنقل الجانبي الفاخر */}
        <nav className="bg-slate-900/50 backdrop-blur-2xl border-b md:border-b-0 md:border-l border-white/5 w-full md:w-72 flex md:flex-col justify-between md:justify-start p-6 sticky top-0 z-50 overflow-x-auto md:overflow-x-visible whitespace-nowrap md:whitespace-normal scrollbar-none gap-4 shadow-2xl">
          
          <div className="hidden md:flex flex-col items-center mb-10 pb-6 border-b border-white/5">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center glow-emerald mb-4 rotate-3">
              <Zap className="w-10 h-10 text-slate-950 fill-current" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white font-montserrat">
              SAQR <span className="text-emerald-500">POS</span>
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Wholesale Intelligence</p>
          </div>
          
          <div className="flex md:flex-col gap-2 w-full">
            <NavLink href="/" icon={<LayoutDashboard className="w-5 h-5" />} label="لوحة التحكم" />
            <NavLink href="/pos" icon={<ShoppingCart className="w-5 h-5" />} label="فاتورة مبيعات" />
            <NavLink href="/purchases" icon={<ShoppingBag className="w-5 h-5" />} label="وارد موردين" />
            <NavLink href="/ledger" icon={<BookOpen className="w-5 h-5" />} label="دفتر الحسابات" />
            <NavLink href="/receipts" icon={<Wallet className="w-5 h-5" />} label="سندات القبض" />
            <NavLink href="/inventory" icon={<Package className="w-5 h-5" />} label="المخزن" />
          </div>

          <div className="hidden md:block mt-auto p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
            <p className="text-[10px] font-bold text-emerald-400/70 text-center uppercase tracking-widest">Standalone Server Connected</p>
          </div>
        </nav>

        {/* محتوى الشاشات المتغير */}
        <main className="flex-1 p-6 md:p-12 lg:p-16 max-w-7xl mx-auto w-full">
          {children}
        </main>

      </body>
    </html>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300 group relative overflow-hidden"
    >
      <span className="relative z-10 transition-transform group-hover:scale-110">{icon}</span>
      <span className="text-sm font-black relative z-10">{label}</span>
      {/* Hover Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </Link>
  );
}
