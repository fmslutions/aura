import React from 'react';

export const Settings: React.FC = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-black text-white tracking-tight">System Settings</h1>
                <p className="text-slate-400 mt-1">Configure global platform parameters and defaults.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <i className="fas fa-globe text-indigo-400"></i> Platform Defaults
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Default Currency</label>
                            <select className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors">
                                <option>EUR (€)</option>
                                <option>USD ($)</option>
                                <option>GBP (£)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">System Language</label>
                            <select className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors">
                                <option>English (UK)</option>
                                <option>Italiano</option>
                                <option>Deutsch</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <i className="fas fa-shield-alt text-indigo-400"></i> Security & Access
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-white/5">
                            <div>
                                <h3 className="text-sm font-bold text-white">Maintenance Mode</h3>
                                <p className="text-xs text-slate-500">Disable access for all non-admin users.</p>
                            </div>
                            <button className="w-12 h-6 bg-slate-800 rounded-full relative transition-colors hover:bg-slate-700">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-slate-400 rounded-full transition-all"></div>
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-white/5">
                            <div>
                                <h3 className="text-sm font-bold text-white">New Registrations</h3>
                                <p className="text-xs text-slate-500">Allow new salons to sign up.</p>
                            </div>
                            <button className="w-12 h-6 bg-indigo-600 rounded-full relative transition-colors">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm"></div>
                            </button>
                        </div>
                    </div>
                </section>

                <section className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl md:col-span-2">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <i className="fas fa-server text-indigo-400"></i> System Status
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['Database', 'Storage', 'Auth Service'].map((service, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 bg-slate-950 rounded-xl border border-white/5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse"></div>
                                <span className="text-sm font-bold text-white">{service}</span>
                                <span className="ml-auto text-xs text-emerald-400 font-mono">OPERATIONAL</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};
