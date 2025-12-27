import React from 'react';

export const Payments: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 text-4xl mb-6">
                <i className="fas fa-credit-card"></i>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Payments & Stripe</h2>
            <p className="text-slate-500 max-w-md">Connect your Stripe account to start accepting payments autonomously.</p>
            <button className="mt-8 px-8 py-3 bg-[#635bff] text-white font-bold rounded-xl hover:shadow-xl hover:shadow-[#635bff]/20 transition-all">
                Connect with Stripe
            </button>
        </div>
    );
};
