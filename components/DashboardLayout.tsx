
import React, { useState } from 'react';
import { AppView, Tenant } from '../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  setView: (view: AppView) => void;
  activeTenant: Tenant;
  logoUrl?: string | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, setView, activeTenant, logoUrl, activeTab, onTabChange }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

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
              <span className="font-bold text-slate-800">Aura Admin</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-slate-600 ml-auto">
            <i className={`fas ${isSidebarOpen ? 'fa-angle-left' : 'fa-angle-right'}`}></i>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
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

        <div className="p-4 border-t border-slate-100">
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
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 text-slate-500">
              <i className="far fa-bell text-lg cursor-pointer"></i>
              <i className="far fa-envelope text-lg cursor-pointer"></i>
            </div>
            <div className="flex items-center space-x-3 cursor-pointer">
              <img src="https://picsum.photos/32/32" className="w-8 h-8 rounded-full border border-slate-200" alt="Avatar" />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-800">Owner Name</p>
                <p className="text-xs text-slate-500">Admin</p>
              </div>
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
