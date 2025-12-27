import React from 'react';

export const Growth: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full aura-gradient opacity-10"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black mb-4">SEO Dominance</h2>
                    <p className="text-slate-400 max-w-xl mb-8">Your salon ranks #1 for "Luxury Hair Salon" in your local area. Our AI is actively monitoring 45 keywords.</p>
                    <div className="flex gap-4">
                        <div className="px-6 py-4 bg-white/10 rounded-2xl backdrop-blur-md">
                            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1">Search Views</p>
                            <p className="text-3xl font-black">14.2k</p>
                        </div>
                        <div className="px-6 py-4 bg-white/10 rounded-2xl backdrop-blur-md">
                            <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-1">CTR</p>
                            <p className="text-3xl font-black">4.8%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
