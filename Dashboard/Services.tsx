import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { Service } from '../types';
import { Modal } from '../src/components/ui';

export const ServicesPage: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInternalLoading, setIsInternalLoading] = useState(false); // For actions
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [newService, setNewService] = useState<Partial<Service>>({
        name: '',
        description: '',
        price: 0,
        duration: 30,
        category: 'Hair'
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setServices(data || []);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateService = async () => {
        setIsInternalLoading(true);
        try {
            const { data: profile } = await supabase.auth.getUser();
            if (!profile.user) throw new Error("Not authenticated");

            // Get tenant_id from profile (or use the one from context if available, but query is safer)
            const { data: userProfile } = await supabase
                .from('profiles')
                .select('tenant_id')
                .eq('id', profile.user.id)
                .single();

            if (!userProfile) throw new Error("No tenant found");

            const { error } = await supabase.from('services').insert({
                ...newService,
                tenant_id: userProfile.tenant_id
            });

            if (error) throw error;

            setIsModalOpen(false);
            setNewService({ name: '', description: '', price: 0, duration: 30, category: 'Hair' });
            fetchServices();
        } catch (error) {
            console.error('Error creating service:', error);
        } finally {
            setIsInternalLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return;

        try {
            const { error } = await supabase.from('services').delete().eq('id', id);
            if (error) throw error;
            fetchServices();
        } catch (error) {
            console.error("Error delete:", error);
        }
    };

    if (loading) return <div className="p-10 text-center"><i className="fas fa-circle-notch animate-spin text-indigo-500 text-3xl"></i></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-900">Service Menu</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-transform active:scale-95"
                >
                    <i className="fas fa-plus mr-2"></i>Add Service
                </button>
            </div>

            {services.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-300">
                    <div className="text-slate-300 text-5xl mb-4"><i className="fas fa-cut"></i></div>
                    <h3 className="text-xl font-bold text-slate-700">No Services Yet</h3>
                    <p className="text-slate-500">Add your first service to start accepting bookings.</p>
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 divide-y divide-slate-100">
                        {services.map((service) => (
                            <div key={service.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold text-xl">
                                        {service.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-bold text-slate-900 text-lg">{service.name}</h4>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wide">{service.category}</span>
                                        </div>
                                        <p className="text-slate-500 text-sm mt-1 max-w-md">{service.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="font-black text-slate-900 text-lg">€{service.price}</p>
                                        <p className="text-xs text-slate-400 font-bold">{service.duration} min</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(service.id)}
                                        className="w-10 h-10 rounded-full hover:bg-red-50 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Service">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Service Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
                            value={newService.name}
                            onChange={e => setNewService({ ...newService, name: e.target.value })}
                            placeholder="e.g., Haircut"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price (€)</label>
                            <input
                                type="number"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
                                value={newService.price}
                                onChange={e => setNewService({ ...newService, price: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duration (min)</label>
                            <input
                                type="number"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
                                value={newService.duration}
                                onChange={e => setNewService({ ...newService, duration: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                        <select
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
                            value={newService.category}
                            onChange={e => setNewService({ ...newService, category: e.target.value })}
                        >
                            <option value="Hair">Hair</option>
                            <option value="Skin">Skin</option>
                            <option value="Nails">Nails</option>
                            <option value="Body">Body</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700 resize-none h-24"
                            value={newService.description}
                            onChange={e => setNewService({ ...newService, description: e.target.value })}
                            placeholder="Brief description..."
                        ></textarea>
                    </div>
                    <button
                        onClick={handleCreateService}
                        disabled={isInternalLoading}
                        className="w-full py-4 bg-slate-900 text-white font-black rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-70"
                    >
                        {isInternalLoading ? <i className="fas fa-circle-notch animate-spin"></i> : 'Create Service'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};
