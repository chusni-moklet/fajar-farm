'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Egg, KeyRound, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { user, login, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Email dan password wajib diisi.', 'error');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        showToast('Login berhasil! Selamat datang.', 'success');
        router.push('/');
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal login. Periksa koneksi Anda.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1329] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
      </div>

      <div className="glass max-w-md w-full p-8 rounded-3xl shadow-xl space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex bg-emerald-500 text-white p-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 justify-center mb-2">
            <Egg className="w-8 h-8 animate-bounce" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent uppercase">
            Fajar Farm
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Masuk untuk mengelola laporan peternakan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Alamat Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="fajar-kand@gmail.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all dark:text-white"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all dark:text-white"
              />
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.01] hover:shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 active:scale-95 transition-all duration-300 focus:outline-none flex items-center justify-center space-x-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>Masuk Sekarang</span>
            )}
          </button>
        </form>

        <div className="border-t border-slate-200 dark:border-slate-800/60 pt-4 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
            Hubungi pemilik peternakan jika Anda lupa kata sandi admin Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
