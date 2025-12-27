
import React, { useState } from 'react';
import { AppView, Tenant } from '../types';
import { User } from '@supabase/supabase-js';

interface DashboardLayoutProps {
  children: React.ReactNode;
  setView: (view: AppView) => void;
  activeTenant: Tenant;
  logoUrl?: string | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  showInstall?: boolean;
  onInstall?: () => void;
  isSuperAdmin?: boolean;
  onSwitchToAdmin?: () => void;
  user?: User | null;
  onLogout?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  setView,
  activeTenant,
  logoUrl,
  activeTab,
  onTabChange,
  showInstall,
  onInstall,
  isSuperAdmin,
  onSwitchToAdmin,
  user,
  onLogout
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isProfileOpen, setProfileOpen] = useState(false);

  const menuItems = [
    { id: 'home', icon: 'fa-chart-pie', label: 'Dashboard' },
    { id: 'bookings', icon: 'fa-calendar-check', label: 'Bookings' },
    { id: 'clients', icon: 'fa-address-book', label: 'Clients' },
    { id: 'staff', icon: 'fa-users', label: 'Staff' },
    { id: 'services', icon: 'fa-scissors', label: 'Services' },
    { id: 'growth', icon: 'fa-bullhorn', label: 'SEO & Growth' },
    { id: 'payments', icon: 'fa-credit-card', label: 'Payments' },
    { id: 'settings', icon: 'fa-cog', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-slate-200 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center space-x-2">
              {logoUrl ? (
                <img src={logoUrl} alt="Aura Logo" className="w-8 h-8 object-contain rounded-lg" />
              ) : (
                <div className="w-8 h-8 aura-gradient rounded-lg flex items-center justify-center text-white">
                  <i className="fas fa-sparkles text-sm"></i>
                </div>
              )}
              <span className="font-bold text-slate-800 truncate">{activeTenant.name || 'Aura Admin'}</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-slate-600 ml-auto">
            <i className={`fas ${isSidebarOpen ? 'fa-angle-left' : 'fa-angle-right'}`}></i>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {isSuperAdmin && (
            <button
              onClick={onSwitchToAdmin}
              className={`w-full flex items-center ${isSidebarOpen ? 'px-4' : 'justify-center'} py-3 rounded-xl transition-all mb-4 bg-slate-900 text-white hover:bg-slate-800 shadow-md`}
            >
              <i className="fas fa-arrow-left w-5"></i>
              {isSidebarOpen && <span className="ml-3 font-bold text-sm">Back to Aura Admin</span>}
            </button>
          )}

          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center ${isSidebarOpen ? 'px-4' : 'justify-center'} py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
              <i className={`fas ${item.icon} w-5`}></i>
              {isSidebarOpen && <span className="ml-3 font-medium text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          {showInstall && (
            <button
              onClick={onInstall}
              className="w-full bg-indigo-600 text-white p-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              <i className="fas fa-download text-xs"></i>
              {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-wider">Install App</span>}
            </button>
          )}
          <button
            onClick={() => setView(AppView.PWA)}
            className="w-full bg-slate-900 text-white p-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-slate-800 transition-colors"
          >
            <i className="fas fa-external-link-alt text-xs"></i>
            {isSidebarOpen && <span className="text-xs font-semibold uppercase tracking-wider">Live PWA</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-slate-800 capitalize">{activeTenant.name}</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase">Pro Plan</span>
            {isSuperAdmin && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase border border-indigo-200">
                Masquerading
              </span>
            )}
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 text-slate-500">
              <i className="far fa-bell text-lg cursor-pointer hover:text-indigo-600 transition-colors"></i>
              <i className="far fa-envelope text-lg cursor-pointer hover:text-indigo-600 transition-colors"></i>
            </div>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-slate-800 max-w-[100px] truncate">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}</p>
                  <p className="text-xs text-slate-500">{isSuperAdmin ? 'Super Admin' : 'Admin'}</p>
                </div>
                <i className="fas fa-chevron-down text-xs text-slate-400"></i>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-50">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setProfileOpen(false); onTabChange('profile'); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <i className="fas fa-user-circle mr-2"></i> Profile
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                    <i className="fas fa-cog mr-2"></i> Settings
                  </button>
                  <div className="border-t border-slate-50 my-1"></div>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
