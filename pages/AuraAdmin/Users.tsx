import React, { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase';

interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    role: string;
    tenant_id: string;
    created_at: string;
    tenants: {
        name: string;
        slug: string;
    } | null;
}

export const Users: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // This query relies on the profile table having RLS that allows SUPER_ADMIN to read all rows
            // And a foreign key relationship to tenants
            const { data, error } = await supabase
                .from('profiles')
                .select('*, tenants(name, slug)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data as any);
        } catch (err) {
            console.error('Error loading users:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (u.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Global Users</h1>
                    <p className="text-slate-400 mt-1">Manage all users across every salon.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-6 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-sm font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Salon</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center">
                                        <i className="fas fa-circle-notch animate-spin text-2xl text-indigo-500"></i>
                                    </td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-white/10">
                                                {user.full_name?.charAt(0) || user.email?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{user.full_name || 'No Name'}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${user.role === 'SUPER_ADMIN' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' :
                                                user.role === 'OWNER' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' :
                                                    'bg-slate-800 text-slate-400 border border-white/5'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {user.tenants ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                <span className="text-sm font-medium text-slate-300">{user.tenants.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-600 font-mono">N/A</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-slate-500 font-mono">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 text-slate-500 hover:text-white transition-colors">
                                            <i className="fas fa-ellipsis-v"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
