import React from 'react';
import { MousePointer, Users, TrendingUp } from 'lucide-react';

export const VehicleAnalytics = ({ carId }: { carId: string }) => {
  // Mock data - in a real app, this would come from a backend/database
  const clicks = Math.floor(Math.random() * 1000) + 100;
  const interactions = Math.floor(Math.random() * 500) + 50;
  const potential = Math.floor(Math.random() * 100);

  return (
    <div className="grid grid-cols-3 gap-2 mt-4">
      <div className="bg-slate-800 p-3 rounded-xl text-center border border-slate-700">
        <MousePointer className="w-4 h-4 text-blue-400 mx-auto mb-1" />
        <div className="text-slate-400 text-[10px] font-bold uppercase">Clicks</div>
        <div className="text-white font-bold text-sm">{clicks}</div>
      </div>
      <div className="bg-slate-800 p-3 rounded-xl text-center border border-slate-700">
        <Users className="w-4 h-4 text-purple-400 mx-auto mb-1" />
        <div className="text-slate-400 text-[10px] font-bold uppercase">Interac.</div>
        <div className="text-white font-bold text-sm">{interactions}</div>
      </div>
      <div className="bg-slate-800 p-3 rounded-xl text-center border border-slate-700">
        <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
        <div className="text-slate-400 text-[10px] font-bold uppercase">Potencial</div>
        <div className="text-white font-bold text-sm">{potential}%</div>
      </div>
    </div>
  );
};
