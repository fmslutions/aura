import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export const Marketing = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [apiKey, setApiKey] = useState('');
    const [senderEmail, setSenderEmail] = useState('');

    // Real data states
    const [totalContacts, setTotalContacts] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMarketingData();
    }, []);

    const fetchMarketingData = async () => {
        try {
            setLoading(true);

            // Fetch total contacts (all users from profiles)
            const { count: contactCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            setTotalContacts(contactCount || 0);
        } catch (error) {
            console.error('Error fetching marketing data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Marketing & Engajamento</h1>
                <p className="text-slate-500 mt-1">Gerencie campanhas de email e newsletter via Brevo.</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                {['dashboard', 'campanhas', 'audiência', 'configurações'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`capitalize px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === tab
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="mt-6">
                {activeTab === 'dashboard' && <MarketingDashboard totalContacts={totalContacts} loading={loading} />}
                {activeTab === 'campanhas' && <CampaignsList />}
                {activeTab === 'audiência' && <AudienceList totalContacts={totalContacts} loading={loading} />}
                {activeTab === 'configurações' && (
                    <MarketingSettings
                        apiKey={apiKey}
                        setApiKey={setApiKey}
                        senderEmail={senderEmail}
                        setSenderEmail={setSenderEmail}
                    />
                )}
            </div>
        </div>
    );
};

// Sub-components

const MarketingDashboard = ({ totalContacts, loading }: { totalContacts: number; loading: boolean }) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <i className="fas fa-circle-notch animate-spin text-3xl text-indigo-500"></i>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard icon="fas fa-users" label="Contatos Totais" value={totalContacts.toString()} sub="Todos os Salões" color="indigo" />
            <StatCard icon="fas fa-paper-plane" label="Emails Enviados" value="0" sub="Nenhuma campanha ativa" color="emerald" />
            <StatCard icon="fas fa-envelope-open-text" label="Taxa de Abertura" value="-" sub="Aguardando Campanhas" color="amber" />
        </div>
    );
};

const CampaignsList = () => {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            // Campaigns table doesn't exist yet - showing empty state
            setCampaigns([]);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <i className="fas fa-circle-notch animate-spin text-3xl text-indigo-500"></i>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Campanhas Recentes</h3>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2">
                    <i className="fas fa-plus"></i> Nova Campanha
                </button>
            </div>

            {campaigns.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 text-2xl">
                        <i className="fas fa-paper-plane"></i>
                    </div>
                    <h4 className="text-slate-800 font-bold mb-2">Nenhuma Campanha Criada</h4>
                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                        Clique em "Nova Campanha" para começar a enviar emails para seus clientes.
                    </p>
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Nome</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Data Envio</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Abertura</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {campaigns.map((c) => (
                                <tr key={c.id} className="hover:bg-indigo-50/30 transition-colors">
                                    <td className="p-4 font-bold text-slate-800">{c.name}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-black tracking-wider ${c.status === 'enviado' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                c.status === 'agendado' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                    'bg-slate-100 text-slate-500 border border-slate-200'
                                            }`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 font-mono">{new Date(c.sent_at).toLocaleDateString('pt-BR')}</td>
                                    <td className="p-4 text-sm text-slate-600 font-mono">{c.open_rate}%</td>
                                    <td className="p-4 text-right">
                                        <button className="text-slate-400 hover:text-indigo-600 transition-colors"><i className="fas fa-ellipsis-v"></i></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const AudienceList = ({ totalContacts, loading }: { totalContacts: number; loading: boolean }) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <i className="fas fa-circle-notch animate-spin text-3xl text-indigo-500"></i>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Segmentos de Audiência</h3>
                <button className="text-indigo-600 text-sm font-bold hover:underline">Sincronizar Contatos</button>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-sm">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 text-2xl">
                    <i className="fas fa-users"></i>
                </div>
                <h4 className="text-slate-800 font-bold mb-2">Sincronização Automática</h4>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                    A audiência é sincronizada automaticamente com a base de usuários do Supabase.
                    Atualmente existem <strong>{totalContacts} contatos</strong> elegíveis para marketing.
                </p>
            </div>
        </div>
    );
};

const MarketingSettings = ({ apiKey, setApiKey, senderEmail, setSenderEmail }: any) => (
    <div className="max-w-2xl bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-cog text-indigo-600"></i> Configuração Brevo (Sendinblue)
        </h3>
        <div className="space-y-6">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">API Key (v3)</label>
                <div className="flex gap-2">
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="xkeysib-xxxxxxxxxxxxxxxxxxxxxxxx"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 font-mono text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 rounded-xl font-bold transition-colors">
                        Testar
                    </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">Chave segura para envio de emails transacionais e marketing.</p>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email do Remetente</label>
                <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="contato@seusalao.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-sm shadow-emerald-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                    Salvar Configurações
                </button>
            </div>
        </div>
    </div>
);

const StatCard = ({ icon, label, value, sub, color }: any) => {
    const colorClasses: any = {
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
    };

    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                <h3 className="text-2xl font-black text-slate-800">{value}</h3>
                <p className="text-xs text-slate-400 mt-1">{sub}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colorClasses[color]}`}>
                <i className={icon}></i>
            </div>
        </div>
    );
};
