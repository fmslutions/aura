import React, { useState, useEffect } from 'react';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/hooks/useAuth';

export const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        if (user) {
            setFullName(user.user_metadata?.full_name || '');
            setAvatarUrl(user.user_metadata?.avatar_url || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    avatar_url: avatarUrl
                }
            });

            if (error) throw error;
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                redirectTo: window.location.origin + '/reset-password', // Simplified
            });
            if (error) throw error;
            setMessage({ type: 'success', text: 'Password reset email sent!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Profile</h1>
                <p className="text-slate-500 mt-2">Manage your personal information and security settings.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                    <p className="font-bold text-sm">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Profile Info */}
                <div className="md:col-span-2 space-y-6">
                    <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <i className="fas fa-user-circle text-indigo-500"></i>
                            Personal Details
                        </h2>

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder="Fabian Martinelli"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Avatar URL</label>
                                <input
                                    type="text"
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder="https://example.com/me.jpg"
                                />
                                <p className="text-[10px] text-slate-400 mt-2 font-bold">
                                    <i className="fas fa-info-circle mr-1"></i>
                                    Upload feature coming soon to Aura Storage.
                                </p>
                            </div>

                            <button
                                disabled={loading}
                                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </section>

                    <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <i className="fas fa-bell text-indigo-500"></i>
                            Notifications
                        </h2>
                        <div className="space-y-4">
                            {['Email Updates', 'Security Alerts', 'New Features'].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <span className="font-bold text-slate-700">{item}</span>
                                    <div className="w-12 h-6 bg-indigo-500 rounded-full relative cursor-pointer">
                                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Security Section */}
                <div className="space-y-6">
                    <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <i className="fas fa-shield-alt text-indigo-500"></i>
                            Security
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Email Address</label>
                                <div className="p-4 bg-slate-50 rounded-xl font-mono text-sm text-slate-600 truncate opacity-75">
                                    {user?.email}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 mb-2">Password</h3>
                                <p className="text-xs text-slate-500 mb-4">Protect your account with a strong password.</p>
                                <button
                                    onClick={handleResetPassword}
                                    disabled={loading}
                                    className="w-full py-3 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all"
                                >
                                    Change Password
                                </button>
                            </div>

                            <div className="border-t border-slate-100 pt-6">
                                <h3 className="font-bold text-slate-900 mb-2">Two-Factor Auth</h3>
                                <div className="flex items-center gap-2 p-3 bg-orange-50 text-orange-700 rounded-xl border border-orange-100 text-xs font-bold mb-4">
                                    <i className="fas fa-lock"></i>
                                    Feature Coming Soon
                                </div>
                                <button disabled className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed">
                                    Enable 2FA
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
