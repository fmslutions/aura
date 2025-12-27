import React, { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase';
import { Tenant } from '../../types';

interface SalonsPageProps {
    onSwitchTenant: (tenantId: string | null) => void;
    activeTenantId?: string;
}

export const Salons: React.FC<SalonsPageProps> = ({ onSwitchTenant, activeTenantId }) => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Manage Salons</h1>
                    <p className="text-slate-400 mt-1">View and manage all registered salons on the platform.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                        <input
                            type="text"
                            placeholder="Search salons..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-6 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-sm font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64 transition-all"
                        />
                    </div>
                    <button className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                        <i className="fas fa-plus"></i> New Salon
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <i className="fas fa-circle-notch animate-spin text-3xl text-indigo-500"></i>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTenants.map(tenant => {
                        const isActive = activeTenantId === tenant.id;
                        return (
                            <div
                                key={tenant.id}
                                className={`group relative overflow-hidden bg-slate-900/50 border ${isActive ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-white/5 hover:border-white/20'} rounded-2xl p-6 transition-all hover:bg-white/5`}
                            >
                                {isActive && (
                                    <div className="absolute top-4 right-4 bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-500/50">
                                        Active Session
                                    </div>
                                )}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/20">
                                        {tenant.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-lg text-white leading-tight mb-1 truncate">{tenant.name}</h3>
                                        <p className="text-xs text-slate-400 font-mono truncate">@{tenant.slug}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                        <span className="text-slate-500">Status</span>
                                        <span className="text-emerald-400 font-bold flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                                            {tenant.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                        <span className="text-slate-500">Plan</span>
                                        <span className="text-indigo-400 font-bold uppercase tracking-wider text-xs">Pro Plan</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2">
                                        <span className="text-slate-500">Revenue</span>
                                        <span className="text-white font-mono font-bold">€0.00</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    {isActive ? (
                                        <button
                                            onClick={() => onSwitchTenant(null)}
                                            className="flex-1 py-3 bg-red-500/10 text-red-400 font-bold rounded-xl text-sm hover:bg-red-500/20 transition-all border border-red-500/20"
                                        >
                                            Disconnect
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onSwitchTenant(tenant.id)}
                                            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
                                        >
                                            <i className="fas fa-key text-xs"></i> Access
                                        </button>
                                    )}
                                    <button className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5">
                                        <i className="fas fa-cog"></i>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
