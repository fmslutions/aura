import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { Tenant } from '../types';

export const Settings: React.FC = () => {
    const [tenant, setTenant] = useState<Partial<Tenant>>({ name: '', slug: '', description: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchTenant();
    }, []);

    const fetchTenant = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
            if (!profile) return;

            const { data: tenantData, error } = await supabase.from('tenants').select('*').eq('id', profile.tenant_id).single();
            if (error) throw error;

            setTenant(tenantData);

        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('tenants')
                .update({
                    name: tenant.name,
                    description: tenant.description,
                    slug: tenant.slug
                })
                .eq('id', tenant.id);

            if (error) throw error;
            alert('Settings saved successfully!');
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Error saving settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="max-w-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-8">Salon Settings</h2>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-lg mb-4">General Info</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-400 ml-2">Display Name</label>
                            <input
                                type="text"
                                value={tenant.name}
                                onChange={(e) => setTenant({ ...tenant, name: e.target.value })}
                                className="w-full mt-1 px-4 py-3 bg-slate-50 rounded-xl border-slate-200 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-400 ml-2">Slug (URL Identifier)</label>
                            <input
                                type="text"
                                value={tenant.slug}
                                onChange={(e) => setTenant({ ...tenant, slug: e.target.value })}
                                className="w-full mt-1 px-4 py-3 bg-slate-50 rounded-xl border-slate-200 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-400 ml-2">Description</label>
                            <textarea
                                rows={3}
                                value={tenant.description || ''}
                                onChange={(e) => setTenant({ ...tenant, description: e.target.value })}
                                className="w-full mt-1 px-4 py-3 bg-slate-50 rounded-xl border-slate-200 font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-slate-900 text-white font-black rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70"
                    >
                        {saving && <i className="fas fa-circle-notch animate-spin"></i>}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
