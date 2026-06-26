'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { dbService, DashboardStats, Kandang, LaporanTelur } from '@/lib/dbService';
import { useToast } from '@/context/ToastContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Warehouse, Heart, Egg, Activity, RotateCw } from 'lucide-react';

export default function DashboardPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await dbService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      showToast(err.message || 'Gagal memuat data statistik.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.round(diffMs / 60000);
    const diffHrs = Math.round(diffMin / 60);
    const diffDays = Math.round(diffHrs / 24);

    if (diffMin < 1) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} menit lalu`;
    if (diffHrs < 24) return `${diffHrs} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const getActivitiesList = () => {
    if (!stats) return [];
    const activities: Array<{ id: string; text: string; time: string; icon: string; bg: string }> = [];

    stats.recentKandang.forEach(k => {
      activities.push({
        id: `act-k-${k.id}`,
        text: `Kandang ${k.nomor_kandang} (${k.jenis_ayam_jantan || '-'} ♂ / ${k.jenis_ayam_betina || '-'} ♀) didaftarkan dengan populasi ${k.total_populasi} ekor.`,
        time: k.created_at,
        icon: 'Warehouse',
        bg: 'bg-indigo-500/10 text-indigo-500'
      });
    });

    stats.recentLaporan.forEach(l => {
      activities.push({
        id: `act-l-${l.id}`,
        text: `Setoran produksi telur sebanyak ${l.jumlah_telur} butir untuk Kandang ${l.nomor_kandang} (${l.periode_laporan}).`,
        time: l.created_at,
        icon: 'Egg',
        bg: 'bg-amber-500/10 text-amber-500'
      });
    });

    // Sort newest to oldest
    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass p-5 rounded-2xl h-24 flex flex-col justify-between">
              <div className="skeleton h-3 w-1/2 rounded-md"></div>
              <div className="skeleton h-6 w-3/4 rounded-md"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass p-5 rounded-2xl lg:col-span-2 h-72 flex flex-col justify-between">
            <div className="skeleton h-4 w-1/3 rounded-md"></div>
            <div className="skeleton h-48 w-full rounded-xl"></div>
          </div>
          <div className="glass p-5 rounded-2xl h-72 flex flex-col justify-between">
            <div className="skeleton h-4 w-1/2 rounded-md"></div>
            <div className="space-y-3 flex-grow mt-4">
              <div className="skeleton h-10 w-full rounded-xl"></div>
              <div className="skeleton h-10 w-full rounded-xl"></div>
              <div className="skeleton h-10 w-full rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activities = getActivitiesList();
  const ratioPercent = stats && stats.totalPopulasi > 0 ? Math.round((stats.totalBetina / stats.totalPopulasi) * 100) : 0;
  const chartData = stats?.eggProductionChartData.labels.map((label, idx) => ({
    name: label,
    Telur: stats.eggProductionChartData.data[idx]
  })) || [];

  return (
    <div className="space-y-6">
      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Kandang */}
        <div className="glass p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Kandang</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">{stats?.totalKandang || 0}</h3>
            </div>
            <div className="bg-indigo-500/10 text-indigo-500 p-3 rounded-xl">
              <Warehouse className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500"></div>
        </div>

        {/* Total Populasi */}
        <div className="glass p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Populasi</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">{stats?.totalPopulasi || 0}</h3>
            </div>
            <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 flex justify-between">
            <span>Jantan: {stats?.totalJantan || 0} ekor</span>
            <span>Betina: {stats?.totalBetina || 0} ekor</span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500"></div>
        </div>

        {/* Indukan Betina */}
        <div className="glass p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Indukan Betina</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">{stats?.totalBetina || 0}</h3>
            </div>
            <div className="bg-pink-500/10 text-pink-500 p-3 rounded-xl">
              <Heart className="w-6 h-6 text-pink-500 fill-pink-500/10" />
            </div>
          </div>
          <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-2">
            Rasio Betina: {ratioPercent}% dari populasi
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-pink-500"></div>
        </div>

        {/* Produksi Telur */}
        <div className="glass p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Produksi Telur</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">{stats?.totalTelur || 0}</h3>
            </div>
            <div className="bg-amber-500/10 text-amber-500 p-3 rounded-xl">
              <Egg className="w-6 h-6 text-amber-500 fill-amber-500/10" />
            </div>
          </div>
          <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-2">
            Akumulasi seluruh laporan telur
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500"></div>
        </div>
      </div>

      {/* CHARTS & RECENT ACTIVITY FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart Card */}
        <div className="glass p-5 rounded-2xl lg:col-span-2 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-4 uppercase tracking-wider flex items-center">
            <Activity className="w-4 h-4 text-emerald-500 mr-2" />
            Tren Produksi Telur Terakhir
          </h3>
          <div className="h-64 w-full text-slate-700 dark:text-slate-300">
            {chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/30 rounded-xl">
                <span className="text-xs text-slate-400">Belum ada data setoran telur untuk divisualisasikan</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="name"
                    stroke="currentColor"
                    className="text-[9px] opacity-60"
                    tickLine={false}
                  />
                  <YAxis
                    stroke="currentColor"
                    className="text-[9px] opacity-60"
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(28, 37, 65, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#fff'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Telur"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Activity Feed Card */}
        <div className="glass p-5 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-200/50 dark:border-slate-800/40 pb-2">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center">
              <RotateCw className="w-4 h-4 text-emerald-500 mr-2" />
              Aktivitas Terkini
            </h3>
            <button
              onClick={() => fetchStats(true)}
              disabled={refreshing}
              className="text-xs text-emerald-500 hover:text-emerald-600 focus:outline-none flex items-center space-x-1 font-semibold"
            >
              <RotateCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
          <div className="flex-grow space-y-4 overflow-y-auto max-h-64 pr-1">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-12">Belum ada aktivitas tercatat.</p>
            ) : (
              activities.map((act) => {
                const isEgg = act.icon === 'Egg';
                return (
                  <div key={act.id} className="flex items-start space-x-3 p-2 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/20 transition-colors">
                    <div className={`p-2 rounded-xl ${act.bg} flex-shrink-0`}>
                      {isEgg ? <Egg className="w-3.5 h-3.5" /> : <Warehouse className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-grow">
                      <p className="text-xs font-medium leading-relaxed text-slate-700 dark:text-slate-300">{act.text}</p>
                      <span className="text-[9px] text-slate-400 mt-1 block">{getRelativeTime(act.time)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
