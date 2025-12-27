import React, { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase';
import { Tenant } from '../../types';

export const Overview: React.FC = () => {
    const [stats, setStats] = useState({
        totalSalons: 0,
        activeSalons: 0,
        totalRevenue: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data: tenants, error } = await supabase
                .from('tenants')
                .select('*');

            if (error) throw error;

            setStats({
                totalSalons: tenants?.length || 0,
                activeSalons: tenants?.filter(t => t.status === 'ACTIVE').length || 0,
                totalRevenue: 0, // Placeholder for future stripe integration
            });
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <i className="fas fa-circle-notch animate-spin text-4xl text-indigo-500"></i>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total de Salões', value: stats.totalSalons, icon: 'fa-store', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Assinaturas Ativas', value: stats.activeSalons, icon: 'fa-check-circle', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Recorrência Mensal', value: '€0.00', icon: 'fa-coins', color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Saúde do Sistema', value: '100%', icon: 'fa-heartbeat', color: 'text-pink-600', bg: 'bg-pink-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl relative overflow-hidden group hover:shadow-md transition-all shadow-sm">
                        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color}`}>
                            <i className={`fas ${stat.icon} text-6xl`}></i>
                        </div>
                        <div className="relative">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                                <i className={`fas ${stat.icon} text-xl`}></i>
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 mb-1">{stat.value}</h3>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart Placeholder */}
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-slate-800">Crescimento de Receita</h3>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200">7D</button>
                            <button className="px-3 py-1 rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">30D</button>
                            <button className="px-3 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200">1A</button>
                        </div>
                    </div>
                    <div className="h-64 flex items-end gap-2 px-2">
                        {/* Mock Chart */}
                        {[30, 45, 35, 60, 50, 75, 65, 80, 70, 90, 85, 95].map((h, i) => (
                            <div key={i} className="flex-1 bg-indigo-50/80 hover:bg-indigo-100 rounded-t-lg relative group transition-all" style={{ height: `${h}%` }}>
                                <div className="absolute inset-x-1 bottom-0 bg-indigo-500/20 h-full rounded-t-lg opacity-30"></div>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                                    €{h * 100}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-slate-400 font-bold uppercase tracking-widest px-2">
                        <span>Jan</span><span>Dez</span>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 text-slate-800">Atividade Recente</h3>
                    <RecentActivityList />
                </div>
            </div>
        </div>
    );
};

// Recent Activity Component
const RecentActivityList = () => {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentActivity();
    }, []);

    const fetchRecentActivity = async () => {
        try {
            setLoading(true);

            // Fetch recent tenants as activity logs
            const { data: recentTenants, error } = await supabase
                .from('tenants')
                .select('name, created_at, status')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;

            const formattedActivities = (recentTenants || []).map((tenant: any) => ({
                action: 'Novo Salão Registrado',
                subject: tenant.name,
                time: getRelativeTime(tenant.created_at),
                icon: 'fa-plus',
                color: 'text-emerald-600',
                bg: 'bg-emerald-50'
            }));

            setActivities(formattedActivities);
        } catch (error) {
            console.error('Error fetching activity:', error);
            setActivities([]);
        } finally {
            setLoading(false);
        }
    };

    const getRelativeTime = (timestamp: string) => {
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now.getTime() - past.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Agora';
        if (diffMins < 60) return `${diffMins}m atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        return `${diffDays}d atrás`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <i className="fas fa-circle-notch animate-spin text-2xl text-indigo-500"></i>
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="text-center p-8">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <i className="fas fa-history"></i>
                </div>
                <p className="text-sm text-slate-500">Nenhuma atividade recente</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {activities.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className={`mt-1 p-2 rounded-lg ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                            <i className={`fas ${item.icon} text-xs`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.action}</p>
                            <p className="text-xs text-slate-500 truncate">{item.subject}</p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">{item.time}</span>
                    </div>
                ))}
            </div>
            <button className="w-full mt-6 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all">
                Ver Todos os Logs
            </button>
        </>
    );
};
