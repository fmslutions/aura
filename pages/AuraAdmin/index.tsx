import React, { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/hooks/useAuth';
import { Tenant } from '../../types';

interface AuraAdminProps {
    onSwitchTenant: (tenantId: string | null) => void;
    activeTenantId?: string;
    onLogout: () => void;
}

export const AuraAdmin: React.FC<AuraAdminProps> = ({ onSwitchTenant, activeTenantId, onLogout }) => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            const { data, error } = await supabase
                .from('tenants')
                .select('*');

            if (error) throw error;

            const mappedTenants: Tenant[] = (data || []).map(t => ({
                id: t.id,
                name: t.name,
                slug: t.slug,
                primaryColor: t.primary_color || '#6366f1',
                secondaryColor: t.secondary_color || '#a855f7',
                description: 'Aura Salon',
                address: 'Managed by Aura',
                languages: ['en'],
                timezone: 'UTC',
                currency: 'EUR',
                stripeConnected: false,
                status: 'ACTIVE'
            }));

            setTenants(mappedTenants);
        } catch (err) {
            console.error('Error loading tenants:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            {/* Top Bar */}
            <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl aura-gradient flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <i className="fas fa-shield-cat text-lg"></i>
                    </div>
                    <h1 className="font-bold text-lg tracking-tight">Aura Control Center</h1>
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                        Super Admin
                    </span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-slate-200">{user?.email}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Global Administrator</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all text-slate-400 hover:text-white"
                    >
                        <i className="fas fa-power-off"></i>
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Salons', value: tenants.length, icon: 'fa-store', color: 'text-indigo-400' },
                        { label: 'Active Subscriptions', value: '0', icon: 'fa-credit-card', color: 'text-green-400' },
                        { label: 'Global Revenue', value: '€0.00', icon: 'fa-chart-line', color: 'text-white' },
                        { label: 'System Status', value: 'Healthy', icon: 'fa-server', color: 'text-emerald-400' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-3xl backdrop-blur-sm">
                            <div className="flex justify-between items-start mb-4">
                                <i className={`fas ${stat.icon} ${stat.color} text-xl`}></i>
                            </div>
                            <h3 className="text-3xl font-black mb-1">{stat.value}</h3>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">Manage Tenancy</h2>
                    <div className="relative">
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                        <input
                            type="text"
                            placeholder="Search salons..."
                            className="pl-10 pr-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64 transition-all"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <i className="fas fa-circle-notch animate-spin text-3xl text-indigo-500"></i>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tenants.map(tenant => {
                            const isActive = activeTenantId === tenant.id;
                            return (
                                <div
                                    key={tenant.id}
                                    className={`group relative overflow-hidden bg-white/5 border ${isActive ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-white/5 hover:border-white/20'} rounded-[2rem] p-6 transition-all hover:bg-white/10`}
                                >
                                    {isActive && (
                                        <div className="absolute top-4 right-4 bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                            Active Session
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                                            {tenant.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight mb-1">{tenant.name}</h3>
                                            <p className="text-xs text-slate-400 font-mono">{tenant.slug}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Status</span>
                                            <span className="text-green-400 font-bold flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                                {tenant.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Location</span>
                                            <span className="text-slate-300 font-medium truncate max-w-[150px]">{tenant.address}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        {isActive ? (
                                            <button
                                                onClick={() => onSwitchTenant(null)}
                                                className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-700 transition-colors"
                                            >
                                                Exit Dashboard
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => onSwitchTenant(tenant.id)}
                                                className="flex-1 py-3 bg-white text-slate-900 font-bold rounded-xl text-sm hover:bg-indigo-50 transition-colors shadow-lg shadow-black/20"
                                            >
                                                Access Dashboard
                                            </button>
                                        )}
                                        <button className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                                            <i className="fas fa-cog"></i>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};
