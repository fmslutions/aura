import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { Tenant } from '../types';

interface HomeProps {
  activeTenant: Tenant;
}

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  booking_date: string;
  booking_time: string;
  status: string;
  services: { name: string; price: number } | null;
  staff: { full_name: string } | null;
}

interface StaffMember {
  id: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  bookingCount: number;
}

export const Home: React.FC<HomeProps> = ({ activeTenant }) => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookings: 0,
    monthlyRevenue: 0,
    totalClients: 0,
    occupancyRate: 0
  });
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [topStaff, setTopStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [activeTenant.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all bookings for stats
      const { data: allBookings } = await supabase
        .from('bookings')
        .select('*, services(name, price), staff(full_name)');

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const currentMonth = new Date().toISOString().slice(0, 7);

      const todayBookings = allBookings?.filter(b => b.booking_date === today) || [];
      const monthBookings = allBookings?.filter(b => b.booking_date?.startsWith(currentMonth)) || [];
      const confirmedBookings = allBookings?.filter(b => b.status === 'CONFIRMED') || [];

      const monthlyRev = confirmedBookings.reduce((sum, b: any) => {
        return sum + (b.services?.price || 0);
      }, 0);

      const uniqueClients = new Set(allBookings?.map((b: any) => b.customer_email)).size;

      setStats({
        totalBookings: allBookings?.length || 0,
        todayBookings: todayBookings.length,
        monthlyRevenue: monthlyRev,
        totalClients: uniqueClients,
        occupancyRate: 85 // Mock for now
      });

      // Fetch upcoming bookings (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const { data: upcoming } = await supabase
        .from('bookings')
        .select('*, services(name, price), staff(full_name)')
        .gte('booking_date', today)
        .lte('booking_date', nextWeek.toISOString().split('T')[0])
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true })
        .limit(5);

      setUpcomingBookings(upcoming || []);

      // Fetch top staff (by booking count this month)
      const { data: staff } = await supabase
        .from('staff')
        .select('id, full_name, role, avatar_url');

      if (staff) {
        const staffWithCounts = await Promise.all(
          staff.map(async (s: any) => {
            const { count } = await supabase
              .from('bookings')
              .select('*', { count: 'exact', head: true })
              .eq('staff_id', s.id)
              .gte('booking_date', currentMonth + '-01');

            return { ...s, bookingCount: count || 0 };
          })
        );

        setTopStaff(staffWithCounts.sort((a, b) => b.bookingCount - a.bookingCount).slice(0, 3));
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'COMPLETED': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <i className="fas fa-circle-notch animate-spin text-4xl text-indigo-500"></i>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-500">Bem-vindo ao painel de controle do {activeTenant.name}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Agendamentos Hoje</p>
              <p className="text-3xl font-black text-slate-900">{stats.todayBookings}</p>
              <p className="text-xs text-slate-400 mt-1">Total: {stats.totalBookings}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <i className="fas fa-calendar-check text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Receita Mensal</p>
              <p className="text-3xl font-black text-slate-900">€{stats.monthlyRevenue.toLocaleString()}</p>
              <p className="text-xs text-emerald-600 mt-1 font-bold">+12% vs mês anterior</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <i className="fas fa-euro-sign text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Clientes Totais</p>
              <p className="text-3xl font-black text-slate-900">{stats.totalClients}</p>
              <p className="text-xs text-slate-400 mt-1">Clientes únicos</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
              <i className="fas fa-users text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Taxa de Ocupação</p>
              <p className="text-3xl font-black text-slate-900">{stats.occupancyRate}%</p>
              <p className="text-xs text-amber-600 mt-1 font-bold">Excelente desempenho</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <i className="fas fa-chart-line text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900">Próximos Agendamentos</h3>
              <button className="text-indigo-600 text-sm font-bold hover:underline">Ver Todos</button>
            </div>

            <div className="space-y-4">
              {upcomingBookings.length > 0 ? upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-indigo-50/50 transition-all cursor-pointer border border-slate-100">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-black">
                    {booking.booking_date?.split('-')[2] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{booking.customer_name}</h4>
                    <p className="text-xs text-slate-500 truncate">{booking.services?.name} • {booking.staff?.full_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{booking.booking_time}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <i className="fas fa-calendar-times text-2xl"></i>
                  </div>
                  <p className="text-slate-500 font-bold">Nenhum agendamento próximo</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Staff & Quick Actions */}
        <div className="space-y-6">
          {/* Top Staff */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-black text-slate-900 mb-6">Equipe em Destaque</h3>
            <div className="space-y-4">
              {topStaff.map((staff, index) => (
                <div key={staff.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-sm">
                    {staff.avatar_url ? (
                      <img src={staff.avatar_url} alt={staff.full_name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      staff.full_name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{staff.full_name}</h4>
                    <p className="text-xs text-slate-500 truncate">{staff.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-indigo-600">{staff.bookingCount}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">serviços</p>
                  </div>
                </div>
              ))}
              {topStaff.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">Nenhum membro da equipe cadastrado</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-black mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-3 px-4 rounded-xl font-bold text-sm transition-all text-left flex items-center gap-3">
                <i className="fas fa-plus-circle"></i> Novo Agendamento
              </button>
              <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-3 px-4 rounded-xl font-bold text-sm transition-all text-left flex items-center gap-3">
                <i className="fas fa-user-plus"></i> Adicionar Cliente
              </button>
              <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-3 px-4 rounded-xl font-bold text-sm transition-all text-left flex items-center gap-3">
                <i className="fas fa-chart-bar"></i> Ver Relatórios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
