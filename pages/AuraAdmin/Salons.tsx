import React, { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase';
import { Tenant } from '../../types';

interface SalonsPageProps {
    onSwitchTenant: (tenantId: string | null) => void;
    activeTenantId?: string;
}

interface Plan {
    name: string;
    display_name: string;
    modules: string[];
}

export const Salons: React.FC<SalonsPageProps> = ({ onSwitchTenant, activeTenantId }) => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<any>(null);
    const [plans, setPlans] = useState<Plan[]>([]);

    // Settings form state
    const [settingsForm, setSettingsForm] = useState({
        name: '',
        slug: '',
        plan: 'FREE',
        status: 'ACTIVE',
        modules: [] as string[]
    });

    useEffect(() => {
        fetchTenants();
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const { data, error } = await supabase
                .from('plans')
                .select('name, display_name, modules');

            if (error) throw error;
            setPlans(data || []);
        } catch (error) {
            console.error('Error fetching plans:', error);
        }
    };

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
                status: t.status || 'ACTIVE',
                plan: t.plan || 'FREE',
                modules: Array.isArray(t.modules) ? t.modules : []
            }));

            setTenants(mappedTenants);
        } catch (err) {
            console.error('Error loading tenants:', err);
        } finally {
            setLoading(false);
        }
    };

    const openSettings = (tenant: any) => {
        setSelectedTenant(tenant);
        setSettingsForm({
            name: tenant.name,
            slug: tenant.slug,
            plan: tenant.plan || 'FREE',
            status: tenant.status || 'ACTIVE',
            modules: tenant.modules || []
        });
        setShowSettingsModal(true);
    };

    const handleSaveSettings = async () => {
        if (!selectedTenant) return;

        try {
            const { error } = await supabase
                .from('tenants')
                .update({
                    name: settingsForm.name,
                    slug: settingsForm.slug,
                    plan: settingsForm.plan,
                    status: settingsForm.status,
                    modules: settingsForm.modules
                })
                .eq('id', selectedTenant.id);

            if (error) throw error;

            alert('Configurações atualizadas com sucesso!');
            setShowSettingsModal(false);
            fetchTenants(); // Refresh list
        } catch (error) {
            console.error('Error updating tenant:', error);
            alert('Erro ao atualizar configurações');
        }
    };

    const toggleModule = (moduleName: string) => {
        setSettingsForm(prev => ({
            ...prev,
            modules: prev.modules.includes(moduleName)
                ? prev.modules.filter(m => m !== moduleName)
                : [...prev.modules, moduleName]
        }));
    };

    const getAvailableModules = () => {
        const selectedPlan = plans.find(p => p.name === settingsForm.plan);
        return selectedPlan?.modules || [];
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
                                        <span className={`font-bold flex items-center gap-2 ${tenant.status === 'ACTIVE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${tenant.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                            {tenant.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                                        <span className="text-slate-500">Plano</span>
                                        <span className="text-indigo-600 font-bold uppercase tracking-wider text-xs bg-indigo-50 px-2 py-0.5 rounded-md">{tenant.plan || 'FREE'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2">
                                        <span className="text-slate-500">Módulos</span>
                                        <span className="text-slate-800 font-mono font-bold text-xs">{(tenant.modules?.length || 0)}</span>
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
                                    <button
                                        onClick={() => openSettings(tenant)}
                                        className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-colors border border-slate-100">
                                        <i className="fas fa-cog"></i>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Settings Modal */}
            {showSettingsModal && selectedTenant && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">Configurações do Salão</h3>
                                <p className="text-sm text-slate-500 mt-1">{selectedTenant.name}</p>
                            </div>
                            <button
                                onClick={() => setShowSettingsModal(false)}
                                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider">Informações Básicas</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome do Salão</label>
                                        <input
                                            type="text"
                                            value={settingsForm.name}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Slug (URL)</label>
                                        <input
                                            type="text"
                                            value={settingsForm.slug}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, slug: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-mono text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Plan & Status */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider">Plano & Status</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Plano de Assinatura</label>
                                        <select
                                            value={settingsForm.plan}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, plan: e.target.value, modules: [] })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                                            {plans.map(plan => (
                                                <option key={plan.name} value={plan.name}>{plan.display_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status da Conta</label>
                                        <select
                                            value={settingsForm.status}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, status: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                                            <option value="ACTIVE">ATIVO</option>
                                            <option value="SUSPENDED">SUSPENSO</option>
                                            <option value="PAUSED">PAUSADO</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Modules */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider">Módulos Disponíveis</h4>
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    {getAvailableModules().length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {getAvailableModules().map(moduleName => (
                                                <label key={moduleName} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 hover:border-indigo-200 cursor-pointer transition-all">
                                                    <input
                                                        type="checkbox"
                                                        checked={settingsForm.modules.includes(moduleName)}
                                                        onChange={() => toggleModule(moduleName)}
                                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-sm font-bold text-slate-700 capitalize">{moduleName.replace('_', ' ')}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 text-center py-4">Nenhum módulo disponível neste plano</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                            <button
                                onClick={() => setShowSettingsModal(false)}
                                className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all">
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveSettings}
                                className="px-6 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
