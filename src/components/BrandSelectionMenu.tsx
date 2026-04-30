import React from 'react';
import { motion } from 'motion/react';
import { APP_CONFIG } from '../config';

interface BrandSelectionMenuProps {
  onSelectBrand: (brand: string) => void;
  selectedBrand: string;
}

export const BrandSelectionMenu: React.FC<BrandSelectionMenuProps> = ({ onSelectBrand, selectedBrand }) => {
  return (
    <div className="space-y-12 mb-16">
      {APP_CONFIG.menu_config.categories.map((category, idx) => (
        <div key={idx} className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] whitespace-nowrap">
              {category.label}
            </h3>
            <div className="h-px bg-white/10 w-full" />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {category.brands.map((brand) => {
              const isSelected = selectedBrand.toLowerCase() === brand.name.toLowerCase();
              
              return (
                <motion.button
                  key={brand.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectBrand(brand.name)}
                  className={`
                    p-6 rounded-3xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 group relative overflow-hidden
                    ${isSelected 
                      ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-600/30 ring-2 ring-blue-400/50' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}
                  `}
                >
                  {/* Decorative Glow for isSelected */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-blue-400/20 blur-2xl -z-10 animate-pulse" />
                  )}

                  <div className="text-center">
                    <p className={`text-xs font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                      {brand.name}
                    </p>
                    {brand.origin && isSelected && (
                      <p className="text-[8px] font-bold text-blue-200 uppercase tracking-tighter mt-1">
                        ORIGIN: {brand.origin}
                      </p>
                    )}
                  </div>

                  {brand.priority && !isSelected && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping" />
                      <div className="w-1 h-1 bg-blue-500 rounded-full" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
