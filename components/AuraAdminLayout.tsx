import React, { useState } from 'react';
import { useAuth } from '../src/hooks/useAuth';

interface AuraAdminLayoutProps {
    children: React.ReactNode;
    activePage: string;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

export const AuraAdminLayout: React.FC<AuraAdminLayoutProps> = ({ children, activePage, onNavigate, onLogout }) => {
    const { user } = useAuth();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const menuItems = [
        { id: 'overview', icon: 'fa-chart-line', label: 'Visão Geral' },
        { id: 'salons', icon: 'fa-store', label: 'Salões' },
        { id: 'users', icon: 'fa-users', label: 'Usuários' },
        { id: 'reports', icon: 'fa-file-alt', label: 'Relatórios' },
        { id: 'marketing', icon: 'fa-bullhorn', label: 'Marketing' },
        { id: 'settings', icon: 'fa-cog', label: 'Configurações' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex font-outfit">
            {/* Sidebar */}
            <aside className={`bg-white border-r border-slate-100 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col sticky top-0 h-screen z-40 shadow-sm`}>
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen && (
                        <div className="flex items-center gap-3 animate-in fade-in duration-300">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <i className="fas fa-shield-cat text-sm"></i>
                            </div>
                            <span className="font-bold text-lg tracking-tight text-slate-900">Admin Aura</span>
                        </div>
                    )}
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-indigo-600 ml-auto transition-colors">
                        <i className={`fas ${isSidebarOpen ? 'fa-angle-left' : 'fa-angle-right'}`}></i>
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center ${isSidebarOpen ? 'px-4' : 'justify-center'} py-3.5 rounded-xl transition-all duration-200 group relative ${activePage === item.id
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            {activePage === item.id && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full"></div>
                            )}
                            <i className={`fas ${item.icon} w-5 text-center transition-transform group-hover:scale-110 ${activePage === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`}></i>
                            {isSidebarOpen && <span className="ml-3 font-medium text-sm">{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className={`flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors ${!isSidebarOpen && 'justify-center'}`}>
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-200">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">{user?.user_metadata?.full_name || 'Super Admin'}</p>
                                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                            </div>
                        )}
                        {isSidebarOpen && (
                            <button onClick={onLogout} className="text-slate-300 hover:text-rose-500 transition-colors">
                                <i className="fas fa-sign-out-alt"></i>
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col">
                <header className="h-20 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8">
                    <h2 className="text-2xl font-bold capitalize tracking-tight flex items-center gap-3 text-slate-900">
                        <span className="text-slate-300 font-light">/</span> {activePage === 'overview' ? 'Visão Geral' : activePage}
                    </h2>
                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all">
                            <i className="far fa-bell"></i>
                        </button>
                        <a href="https://stripe.com" target="_blank" rel="noreferrer" className="px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition-colors flex items-center gap-2">
                            <i className="fab fa-stripe text-indigo-500 text-sm"></i> Stripe Connected
                        </a>
                    </div>
                </header>

                <div className="flex-1 p-8 overflow-y-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};
