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
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gerenciar Salões</h1>
                    <p className="text-slate-500 mt-1">Visualize e gerencie todos os salões registrados na plataforma.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                        <input
                            type="text"
                            placeholder="Buscar salões..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64 transition-all"
                        />
                    </div>
                    <button className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
                        <i className="fas fa-plus"></i> Novo Salão
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
                                className={`group relative overflow-hidden bg-white border ${isActive ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-100 hover:border-slate-200'} rounded-2xl p-6 transition-all hover:shadow-md shadow-sm`}
                            >
                                {isActive && (
                                    <div className="absolute top-4 right-4 bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">
                                        Sessão Ativa
                                    </div>
                                )}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-100">
                                        {tenant.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1 truncate">{tenant.name}</h3>
                                        <p className="text-xs text-slate-500 font-mono truncate">@{tenant.slug}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                                        <span className="text-slate-500">Status</span>
                                        <span className="text-emerald-600 font-bold flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            {tenant.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                                        <span className="text-slate-500">Plano</span>
                                        <span className="text-indigo-600 font-bold uppercase tracking-wider text-xs bg-indigo-50 px-2 py-0.5 rounded-md">Pro Plan</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2">
                                        <span className="text-slate-500">Receita</span>
                                        <span className="text-slate-800 font-mono font-bold">€0.00</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    {isActive ? (
                                        <button
                                            onClick={() => onSwitchTenant(null)}
                                            className="flex-1 py-3 bg-rose-50 text-rose-600 font-bold rounded-xl text-sm hover:bg-rose-100 transition-all border border-rose-100"
                                        >
                                            Desconectar
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onSwitchTenant(tenant.id)}
                                            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                                        >
                                            <i className="fas fa-key text-xs"></i> Acessar Painel
                                        </button>
                                    )}
                                    <button className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-colors border border-slate-100">
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
