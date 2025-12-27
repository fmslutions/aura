import React from 'react';

export const Reports: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Relatórios & Análise</h1>
                <p className="text-slate-500 mt-1">Dados detalhados sobre o desempenho da plataforma.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Report Cards */}
                <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                        <i className="fas fa-file-invoice-dollar text-lg"></i>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">Receita Mensal</h3>
                    <p className="text-sm text-slate-500 mt-1 mb-4">Relatório detalhado de todas as assinaturas.</p>
                    <button className="w-full py-2 rounded-lg bg-slate-50 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-100">
                        Baixar PDF
                    </button>
                </div>

                <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                        <i className="fas fa-users text-lg"></i>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">Crescimento de Usuários</h3>
                    <p className="text-sm text-slate-500 mt-1 mb-4">Métricas de aquisição e retenção.</p>
                    <button className="w-full py-2 rounded-lg bg-slate-50 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-100">
                        Baixar CSV
                    </button>
                </div>

                <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                        <i className="fas fa-server text-lg"></i>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">Logs do Sistema</h3>
                    <p className="text-sm text-slate-500 mt-1 mb-4">Atividades técnicas e erros da plataforma.</p>
                    <button className="w-full py-2 rounded-lg bg-slate-50 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-100">
                        Ver Logs
                    </button>
                </div>
            </div>

            {/* Graph Placeholder */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-6 text-slate-800">Métricas de Desempenho</h3>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                    <p>Gráficos detalhados serão exibidos aqui.</p>
                </div>
            </div>
        </div>
    );
};
