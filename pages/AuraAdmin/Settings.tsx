import React from 'react';

export const Settings: React.FC = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Configurações do Sistema</h1>
                <p className="text-slate-500 mt-1">Configure parâmetros globais e padrões da plataforma.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <i className="fas fa-globe text-indigo-600"></i> Padrões da Plataforma
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Moeda Padrão</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all">
                                <option>EUR (€)</option>
                                <option>USD ($)</option>
                                <option>BRL (R$)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Idioma do Sistema</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all">
                                <option>Português (Brasil)</option>
                                <option>English (UK)</option>
                                <option>Italiano</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <i className="fas fa-shield-alt text-indigo-600"></i> Segurança e Acesso
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Modo Manutenção</h3>
                                <p className="text-xs text-slate-500">Desativar acesso para usuários não administradores.</p>
                            </div>
                            <button className="w-12 h-6 bg-slate-200 rounded-full relative transition-colors hover:bg-slate-300">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm"></div>
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Novos Cadastros</h3>
                                <p className="text-xs text-slate-500">Permitir que novos salões se cadastrem.</p>
                            </div>
                            <button className="w-12 h-6 bg-indigo-600 rounded-full relative transition-colors">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm"></div>
                            </button>
                        </div>
                    </div>
                </section>

                <section className="bg-white border border-slate-100 p-8 rounded-2xl md:col-span-2 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <i className="fas fa-server text-indigo-600"></i> Status do Sistema
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['Banco de Dados', 'Armazenamento', 'Serviço de Auth'].map((service, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse"></div>
                                <span className="text-sm font-bold text-slate-800">{service}</span>
                                <span className="ml-auto text-xs text-emerald-600 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded">OPERACIONAL</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};
