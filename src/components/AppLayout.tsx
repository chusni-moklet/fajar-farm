'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Egg, Moon, Sun, LineChart, Warehouse, Tags, ClipboardList, LogOut, ShieldAlert, Wallet, Bird } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, loading, logout, isSimulationMode } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Load and apply theme
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (storedTheme === 'light') {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    } else {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  // Auth Redirect Guard
  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  // If path is /login, just render children
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // If auth is loading, show premium fullscreen skeleton loader
  if (loading || (!user && pathname !== '/login')) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b1329] flex flex-col items-center justify-center p-6 text-slate-800 dark:text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-emerald-500 text-white p-3 rounded-2xl animate-bounce shadow-lg shadow-emerald-500/20">
            <Egg className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-emerald-500">FAJAR FARM</h2>
          <div className="space-y-2 w-48">
            <div className="skeleton h-3 w-full rounded-md"></div>
            <div className="skeleton h-3 w-5/6 rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LineChart },
    { href: '/admin/kandang', label: 'Master Kandang', icon: Warehouse },
    { href: '/admin/jenis-ayam', label: 'Jenis Ayam', icon: Tags },
    { href: '/admin/anak-ayam', label: 'Anak Ayam', icon: Bird },
    { href: '/laporan', label: 'Input Telur', icon: ClipboardList },
    { href: '/admin/penetasan', label: 'Penetasan', icon: Egg },
    { href: '/admin/keuangan', label: 'Keuangan', icon: Wallet }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#0b1329] dark:text-slate-100 flex flex-col pb-20 md:pb-0">
      {/* TOP HEADER / NAVBAR */}
      <header className="sticky top-0 z-40 w-full glass shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-md shadow-emerald-500/20">
              <Egg className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-md sm:text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                FAJAR FARM
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Sistem Laporan Peternakan</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Simulation Mode Badge */}
            {isSimulationMode && (
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-500/20">
                <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                Simulation Mode
              </span>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none"
              title="Ganti Tema"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors focus:outline-none"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* NAVIGATION TABS (DESKTOP) */}
        <div className="hidden md:flex border-b border-slate-200 dark:border-slate-800 mb-8 space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-300 flex items-center space-x-2 ${
                  isActive
                    ? 'border-emerald-500 text-emerald-500 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Content Wrapper */}
        <div className="animate-in fade-in duration-300">
          {children}
        </div>
      </main>

      {/* NAVIGATION TABS (MOBILE BOTTOM BAR) */}
      <nav className="md:hidden fixed bottom-0 left-0 z-40 w-full glass shadow-lg border-t border-slate-200 dark:border-slate-800/60 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center space-y-1 font-medium transition-colors duration-300 ${
                isActive
                  ? 'text-emerald-500 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
