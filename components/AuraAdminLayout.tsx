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
        { id: 'overview', icon: 'fa-chart-line', label: 'Overview' },
        { id: 'salons', icon: 'fa-store', label: 'Salons' },
        { id: 'users', icon: 'fa-users', label: 'Users' },
        { id: 'reports', icon: 'fa-file-alt', label: 'Reports' },
        { id: 'marketing', icon: 'fa-bullhorn', label: 'Marketing' },
        { id: 'settings', icon: 'fa-cog', label: 'Settings' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans flex">
            {/* Sidebar */}
            <aside className={`bg-slate-900/50 border-r border-white/5 backdrop-blur-xl transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col sticky top-0 h-screen z-40`}>
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen && (
                        <div className="flex items-center gap-3 animate-in fade-in duration-300">
                            <div className="w-8 h-8 rounded-lg aura-gradient flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                <i className="fas fa-shield-cat text-sm"></i>
                            </div>
                            <span className="font-bold text-lg tracking-tight">Aura Admin</span>
                        </div>
                    )}
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-500 hover:text-white ml-auto transition-colors">
                        <i className={`fas ${isSidebarOpen ? 'fa-angle-left' : 'fa-angle-right'}`}></i>
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center ${isSidebarOpen ? 'px-4' : 'justify-center'} py-3.5 rounded-xl transition-all duration-200 group relative ${activePage === item.id
                                    ? 'bg-indigo-500/10 text-indigo-400'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            {activePage === item.id && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                            )}
                            <i className={`fas ${item.icon} w-5 text-center transition-transform group-hover:scale-110 ${activePage === item.id ? 'text-indigo-400' : ''}`}></i>
                            {isSidebarOpen && <span className="ml-3 font-medium text-sm">{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className={`flex items-center gap-3 p-3 rounded-xl bg-white/5 ${!isSidebarOpen && 'justify-center'}`}>
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs ring-1 ring-indigo-500/30">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate">{user?.user_metadata?.full_name || 'Super Admin'}</p>
                                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                            </div>
                        )}
                        {isSidebarOpen && (
                            <button onClick={onLogout} className="text-slate-500 hover:text-red-400 transition-colors">
                                <i className="fas fa-sign-out-alt"></i>
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col">
                <header className="h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8">
                    <h2 className="text-xl font-bold capitalize tracking-tight flex items-center gap-3">
                        <span className="text-slate-500 font-light">Admin /</span> {activePage}
                    </h2>
                    <div className="flex items-center gap-4">
                        <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                            <i className="far fa-bell"></i>
                        </button>
                        <a href="https://stripe.com" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-full bg-white/5 text-xs font-bold text-slate-400 hover:bg-white/10 transition-colors flex items-center gap-2">
                            <i className="fab fa-stripe text-indigo-400"></i> Stripe Connected
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
