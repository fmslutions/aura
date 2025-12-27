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
                    { label: 'Total Salons', value: stats.totalSalons, icon: 'fa-store', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                    { label: 'Active Subscriptions', value: stats.activeSalons, icon: 'fa-check-circle', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Monthly Recurring', value: '€0.00', icon: 'fa-coins', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { label: 'System Health', value: '100%', icon: 'fa-heartbeat', color: 'text-pink-400', bg: 'bg-pink-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-all">
                        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color}`}>
                            <i className={`fas ${stat.icon} text-6xl`}></i>
                        </div>
                        <div className="relative">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                                <i className={`fas ${stat.icon} text-xl`}></i>
                            </div>
                            <h3 className="text-3xl font-black text-white mb-1">{stat.value}</h3>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart Placeholder */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg">Revenue Growth</h3>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 rounded-lg bg-white/5 text-xs font-bold text-white hover:bg-white/10">7D</button>
                            <button className="px-3 py-1 rounded-lg bg-indigo-500 text-xs font-bold text-white">30D</button>
                            <button className="px-3 py-1 rounded-lg bg-white/5 text-xs font-bold text-white hover:bg-white/10">1Y</button>
                        </div>
                    </div>
                    <div className="h-64 flex items-end gap-2 px-2">
                        {/* Mock Chart */}
                        {[30, 45, 35, 60, 50, 75, 65, 80, 70, 90, 85, 95].map((h, i) => (
                            <div key={i} className="flex-1 bg-indigo-500/20 hover:bg-indigo-500/40 rounded-t-lg relative group transition-all" style={{ height: `${h}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    €{h * 100}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-slate-500 font-bold uppercase tracking-widest px-2">
                        <span>Jan</span><span>Dec</span>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-6">Recent Activity</h3>
                    <div className="space-y-4">
                        {[
                            { action: 'New Salon Registered', subject: 'Luxe Hair Studio', time: '2m ago', icon: 'fa-plus', color: 'text-green-400' },
                            { action: 'Plan Upgraded', subject: 'Barber Bros', time: '1h ago', icon: 'fa-arrow-up', color: 'text-indigo-400' },
                            { action: 'Support Ticket', subject: 'Nail Artistry', time: '3h ago', icon: 'fa-envelope', color: 'text-amber-400' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                                <div className={`mt-1 p-2 rounded-lg bg-white/5 ${item.color}`}>
                                    <i className={`fas ${item.icon} text-xs`}></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white">{item.action}</p>
                                    <p className="text-xs text-slate-400 truncate">{item.subject}</p>
                                </div>
                                <span className="text-[10px] font-mono text-slate-600 font-bold">{item.time}</span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-3 border border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                        View All Logs
                    </button>
                </div>
            </div>
        </div>
    );
};
