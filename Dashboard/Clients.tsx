import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';

interface Client {
    email: string;
    name: string;
    total_spend: number;
    bookings_count: number;
    last_visit: string;
}

export const ClientsPage: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            // Fetch all confirmed bookings with services to aggregate
            const { data: bookings, error } = await supabase
                .from('bookings')
                .select('customer_email, customer_name, start_time, services(price)')
                .eq('status', 'CONFIRMED')
                .order('start_time', { ascending: false });

            if (error) throw error;

            const clientMap = new Map<string, Client>();

            bookings?.forEach((b: any) => {
                if (!b.customer_email) return;

                const current = clientMap.get(b.customer_email) || {
                    email: b.customer_email,
                    name: b.customer_name || 'Unknown',
                    total_spend: 0,
                    bookings_count: 0,
                    last_visit: b.start_time
                };

                // Accumulate stats
                current.total_spend += b.services?.price || 0;
                current.bookings_count += 1;
                // Since we sorted by desc time, the first encounter is the last visit
                if (new Date(b.start_time) > new Date(current.last_visit)) {
                    current.last_visit = b.start_time;
                }

                clientMap.set(b.customer_email, current);
            });

            setClients(Array.from(clientMap.values()));

        } catch (error) {
            console.error("Error fetching clients:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center"><i className="fas fa-circle-notch animate-spin text-indigo-500 text-3xl"></i></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Client History</h2>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Client</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Bookings</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Last Visit</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Lifetime Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center text-slate-500">No client history found.</td>
                                </tr>
                            ) : (
                                clients.map((client) => (
                                    <tr key={client.email} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-6 font-bold text-slate-900">
                                            <div>{client.name}</div>
                                            <div className="text-xs text-slate-400 font-normal">{client.email}</div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                                                {client.bookings_count}
                                            </span>
                                        </td>
                                        <td className="p-6 text-slate-500 font-medium">
                                            {new Date(client.last_visit).toLocaleDateString()}
                                        </td>
                                        <td className="p-6 font-black text-slate-900 text-right">€{client.total_spend}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
