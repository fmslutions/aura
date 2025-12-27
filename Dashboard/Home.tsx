import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { Tenant } from '../types';

interface HomeProps {
  activeTenant: Tenant;
  auraLogo: string | null;
  handleGenerateLogo: () => void;
  isGeneratingLogo: boolean;
}

export const Home: React.FC<HomeProps> = ({ activeTenant, auraLogo, handleGenerateLogo, isGeneratingLogo }) => {
  const [revenue, setRevenue] = useState(0);
  const [activeClients, setActiveClients] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [activeTenant.id]);

  const fetchStats = async () => {
    try {
      // 1. Calculate Revenue (Sum of Confirmed Bookings price)
      // Note: In a real production app, price should be stored in bookings to avoid service price changes affecting history.
      // For now, we join services.
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('status, services(price)')
        .eq('status', 'CONFIRMED');

      if (error) throw error;

      let totalRevenue = 0;
      bookings?.forEach((b: any) => {
        if (b.services?.price) {
          totalRevenue += b.services.price;
        }
      });
      setRevenue(totalRevenue);

      // 2. Count Clients (Approximate by unique customer_email in bookings for now, better to distinct client_id)
      const { count, error: countError } = await supabase
        .from('bookings')
        .select('customer_email', { count: 'exact', head: true }); // Simple total bookings count for now as distinct is harder in simple query without RPC

      // Better: Count distinct emails if possible, but for MVP let's show total bookings or keep it simple.
      // Let's use total CONFIRMED bookings as "Active Engagements" if distinct is tricky, or try to get distinct via JS for small datasets.

      // Re-fetching for client counting strategy
      const { data: clientsData } = await supabase
        .from('bookings')
        .select('customer_email')
        .not('customer_email', 'is', null);

      const uniqueClients = new Set(clientsData?.map((c: any) => c.customer_email)).size;
      setActiveClients(uniqueClients);

    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">Aura Platform Brand</h3>
              <p className="text-slate-400 text-sm font-medium">Autonomous identity powered by Nano Banana Pro</p>
            </div>
            <button
              onClick={handleGenerateLogo}
              disabled={isGeneratingLogo}
              className="px-6 py-3 aura-gradient text-white font-black rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              <i className={`fas ${isGeneratingLogo ? 'fa-circle-notch animate-spin' : 'fa-wand-magic-sparkles'}`}></i>
              {isGeneratingLogo ? 'Generating...' : 'Regenerate Logo'}
            </button>
          </div>
          <div className="aspect-video rounded-[2.5rem] bg-slate-900 flex items-center justify-center border-4 border-slate-50 shadow-inner overflow-hidden relative group">
            {auraLogo ? (
              <img src={auraLogo} alt="Aura Logo" className="w-64 h-64 object-contain animate-in zoom-in-95 duration-700" />
            ) : (
              <div className="text-white/20 flex flex-col items-center gap-4">
                <i className="fas fa-image text-6xl"></i>
                <p className="font-black text-xs uppercase tracking-widest">No brand identity generated</p>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Revenue (Verified)</p>
            <p className="text-4xl font-black text-slate-900">
              {loading ? <span className="text-sm">Loading...</span> : `€${revenue.toLocaleString()}`}
            </p>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Distinct Clients</p>
            <p className="text-4xl font-black text-slate-900">
              {loading ? <span className="text-sm">Loading...</span> : activeClients}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
