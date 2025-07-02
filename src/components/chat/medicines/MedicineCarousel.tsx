import React from 'react';
import { motion } from 'framer-motion';
import { MedicineCard } from './MedicineCard';
import { mockMedicines } from '../../../utils/mockData';

interface MedicineCarouselProps {
  onAddToCart: (medicineId: string) => void;
  onShowInfo: (medicineId: string) => void;
}

export function MedicineCarousel({ onAddToCart, onShowInfo }: MedicineCarouselProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-start mb-2"
      >
        <div className="px-2 py-1">
          <p className="text-sm text-white/80">Recommended medications for your condition:</p>
        </div>
      </motion.div>
      
      <div className="flex overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex space-x-0">
          {mockMedicines.map((medicine, index) => (
            <motion.div
              key={medicine.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <MedicineCard
                medicine={medicine}
                onAddToCart={onAddToCart}
                onShowInfo={onShowInfo}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}