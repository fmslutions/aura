import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { Staff } from '../types';
import { Modal } from '../src/components/ui';

export const StaffPage: React.FC = () => {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInternalLoading, setIsInternalLoading] = useState(false);

    // Form State
    const [newStaff, setNewStaff] = useState<Partial<Staff>>({
        name: '',
        role: 'Stylist',
        avatar: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png',
        specialties: []
    });
    const [specialtyInput, setSpecialtyInput] = useState('');

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const { data, error } = await supabase.from('staff').select('*');
            if (error) throw error;
            setStaffList(data || []);
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStaff = async () => {
        setIsInternalLoading(true);
        try {
            const { data: profile } = await supabase.auth.getUser();
            if (!profile.user) throw new Error("Not authenticated");

            const { data: userProfile } = await supabase
                .from('profiles')
                .select('tenant_id')
                .eq('id', profile.user.id)
                .single();

            if (!userProfile) throw new Error("No tenant found");

            const { error } = await supabase.from('staff').insert({
                name: newStaff.name,
                role: newStaff.role,
                avatar_url: newStaff.avatar, // Mapping avatar to avatar_url
                services: newStaff.specialties, // Storing specialties in services JSON column
                tenant_id: userProfile.tenant_id
            });

            if (error) throw error;

            setIsModalOpen(false);
            setNewStaff({
                name: '',
                role: 'Stylist',
                avatar: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png',
                specialties: []
            });
            fetchStaff();
        } catch (error) {
            console.error('Error creating staff:', error);
        } finally {
            setIsInternalLoading(false);
        }
    };

    const addSpecialty = () => {
        if (specialtyInput.trim()) {
            setNewStaff({
                ...newStaff,
                specialties: [...(newStaff.specialties || []), specialtyInput.trim()]
            });
            setSpecialtyInput('');
        }
    };

    const removeSpecialty = (spec: string) => {
        setNewStaff({
            ...newStaff,
            specialties: (newStaff.specialties || []).filter(s => s !== spec)
        });
    };

    if (loading) return <div className="p-10 text-center"><i className="fas fa-circle-notch animate-spin text-indigo-500 text-3xl"></i></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-900">Staff Members</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-5 py-2.5 aura-gradient text-white rounded-xl font-bold text-sm hover:shadow-lg transition-transform active:scale-95"
                >
                    <i className="fas fa-plus mr-2"></i>Add Member
                </button>
            </div>

            {staffList.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-300">
                    <div className="text-slate-300 text-5xl mb-4"><i className="fas fa-user-friends"></i></div>
                    <h3 className="text-xl font-bold text-slate-700">No Staff Yet</h3>
                    <p className="text-slate-500">add your team members to manage bookings.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {staffList.map((member) => (
                        <div key={member.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:border-indigo-200 transition-all group">
                            <div className="flex items-center gap-4 mb-4">
                                <img src={member.avatar || member.avatar_url || 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png'} alt={member.name} className="w-16 h-16 rounded-2xl object-cover shadow-md" />
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">{member.name}</h3>
                                    <p className="text-xs text-indigo-500 font-bold uppercase tracking-wide">{member.role}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(member.specialties || (member as any).services || []).map((spec: string) => (
                                    <span key={spec} className="px-3 py-1 bg-slate-50 rounded-lg text-xs font-semibold text-slate-500">{spec}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Staff Member">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
                            value={newStaff.name}
                            onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                            placeholder="e.g., Jane Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                        <select
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
                            value={newStaff.role}
                            onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
                        >
                            <option value="Stylist">Stylist</option>
                            <option value="Manager">Manager</option>
                            <option value="Assistant">Assistant</option>
                            <option value="Receptionist">Receptionist</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Specialties</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
                                value={specialtyInput}
                                onChange={e => setSpecialtyInput(e.target.value)}
                                placeholder="Add specialty..."
                                onKeyDown={e => e.key === 'Enter' && addSpecialty()}
                            />
                            <button onClick={addSpecialty} className="px-4 py-3 bg-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-300">
                                <i className="fas fa-plus"></i>
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {newStaff.specialties?.map(spec => (
                                <span key={spec} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold flex items-center gap-2">
                                    {spec}
                                    <button onClick={() => removeSpecialty(spec)} className="hover:text-indigo-800"><i className="fas fa-times"></i></button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={handleCreateStaff}
                        disabled={isInternalLoading}
                        className="w-full py-4 bg-slate-900 text-white font-black rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-70"
                    >
                        {isInternalLoading ? <i className="fas fa-circle-notch animate-spin"></i> : 'Create Member'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};
