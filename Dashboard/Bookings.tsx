import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { Booking, Service, Staff } from '../types';
import { Modal } from '../src/components/ui';

export const Bookings: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);

    const [loading, setLoading] = useState(true);
    const [isInternalLoading, setIsInternalLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter
    const [filterStatus, setFilterStatus] = useState('ALL');

    // New Booking Form State
    const [newBooking, setNewBooking] = useState({
        customerName: '',
        customerEmail: '',
        serviceId: '',
        staffId: '',
        date: '',
        time: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Bookings with Relations
            const { data: bookingsData, error: bookingsError } = await supabase
                .from('bookings')
                .select(`
                    *,
                    services:service_id (name, price, duration),
                    staff:staff_id (name)
                `)
                .order('start_time', { ascending: false });

            if (bookingsError) throw bookingsError;

            // Map DB result to Frontend Type
            const mappedBookings: Booking[] = (bookingsData || []).map((b: any) => ({
                id: b.id,
                status: b.status,
                start_time: b.start_time,
                customer: b.customer_name || 'Guest',
                customer_email: b.customer_email,
                service_name: b.services?.name || 'Unknown Service',
                price: b.services?.price || 0,
                staff_name: b.staff?.name // Virtual
            }));

            setBookings(mappedBookings);

            // Fetch Services & Staff for the form
            const { data: servicesData } = await supabase.from('services').select('*');
            setServices(servicesData || []);

            const { data: staffData } = await supabase.from('staff').select('*');
            setStaffList(staffData || []);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBooking = async () => {
        setIsInternalLoading(true);
        try {
            const { data: profile } = await supabase.auth.getUser();
            if (!profile.user) throw new Error("Not authenticated");

            // Get tenant
            const { data: userProfile } = await supabase
                .from('profiles')
                .select('tenant_id')
                .eq('id', profile.user.id)
                .single();

            if (!userProfile) throw new Error("No tenant found");

            // Calculate start and end time
            const startTime = new Date(`${newBooking.date}T${newBooking.time}`).toISOString();
            // Assuming 60 min duration for simplicity here, or fetch service duration
            const selectedService = services.find(s => s.id === newBooking.serviceId);
            const duration = selectedService?.duration || 60;
            const endTimeDate = new Date(`${newBooking.date}T${newBooking.time}`);
            endTimeDate.setMinutes(endTimeDate.getMinutes() + duration);
            const endTime = endTimeDate.toISOString();

            const { error } = await supabase.from('bookings').insert({
                tenant_id: userProfile.tenant_id,
                service_id: newBooking.serviceId,
                staff_id: newBooking.staffId,
                customer_name: newBooking.customerName,
                customer_email: newBooking.customerEmail,
                start_time: startTime,
                end_time: endTime,
                status: 'CONFIRMED'
            });

            if (error) throw error;

            setIsModalOpen(false);
            setNewBooking({
                customerName: '',
                customerEmail: '',
                serviceId: '',
                staffId: '',
                date: '',
                time: ''
            });
            fetchData();
        } catch (error) {
            console.error("Error creating booking:", error);
            alert("Error creating booking: " + (error as any).message);
        } finally {
            setIsInternalLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-700';
            case 'PENDING': return 'bg-amber-100 text-amber-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            case 'COMPLETED': return 'bg-blue-100 text-blue-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const filteredBookings = filterStatus === 'ALL'
        ? bookings
        : bookings.filter(b => b.status === filterStatus);

    if (loading) return <div className="p-10 text-center"><i className="fas fa-circle-notch animate-spin text-indigo-500 text-3xl"></i></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-black text-slate-900">Bookings</h2>
                <div className="flex gap-2">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <option value="ALL">All Status</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PENDING">Pending</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-transform active:scale-95"
                    >
                        <i className="fas fa-plus mr-2"></i>New Booking
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Service</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-slate-500">No bookings found.</td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-6 font-bold text-slate-700">
                                            {booking.start_time ? new Date(booking.start_time).toLocaleString() : 'N/A'}
                                        </td>
                                        <td className="p-6 font-bold text-slate-900">
                                            <div>{booking.customer}</div>
                                            <div className="text-xs text-slate-400 font-normal">{booking.customer_email}</div>
                                        </td>
                                        <td className="p-6 text-slate-500 font-medium">{booking.service_name}</td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="p-6 font-black text-slate-900 text-right">€{booking.price}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Appointment">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Customer Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
                                value={newBooking.customerName}
                                onChange={e => setNewBooking({ ...newBooking, customerName: e.target.value })}
                                placeholder="Alice"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email (Optional)</label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
                                value={newBooking.customerEmail}
                                onChange={e => setNewBooking({ ...newBooking, customerEmail: e.target.value })}
                                placeholder="alice@example.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Service</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
                                value={newBooking.serviceId}
                                onChange={e => setNewBooking({ ...newBooking, serviceId: e.target.value })}
                            >
                                <option value="">Select Service...</option>
                                {services.map(s => <option key={s.id} value={s.id}>{s.name} (€{s.price})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Staff</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
                                value={newBooking.staffId}
                                onChange={e => setNewBooking({ ...newBooking, staffId: e.target.value })}
                            >
                                <option value="">Any Staff</option>
                                {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
                                value={newBooking.date}
                                onChange={e => setNewBooking({ ...newBooking, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time</label>
                            <input
                                type="time"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
                                value={newBooking.time}
                                onChange={e => setNewBooking({ ...newBooking, time: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleCreateBooking}
                        disabled={isInternalLoading || !newBooking.customerName || !newBooking.serviceId || !newBooking.date || !newBooking.time}
                        className="w-full py-4 bg-slate-900 text-white font-black rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-70 mt-2"
                    >
                        {isInternalLoading ? <i className="fas fa-circle-notch animate-spin"></i> : 'Confirm Booking'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};
