import React from 'react';

interface Car {
  id: number;
  model: string;
  image: string;
  cilindrada: string;
  year: number;
  mileage: number;
}

interface ViewHistoryProps {
  viewedCars: Car[];
}

export const ViewHistory: React.FC<ViewHistoryProps> = ({ viewedCars }) => {
  if (viewedCars.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-slate-900 mb-4">Historial de Vistas</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {viewedCars.slice(0, 5).map((car) => (
          <div key={car.id} className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm">
            <img src={car.image} alt={car.model} className="w-full h-24 object-cover rounded-xl mb-2" />
            <p className="text-sm font-bold text-slate-900 truncate">{car.model}</p>
            <p className="text-xs text-slate-500">{car.year}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
