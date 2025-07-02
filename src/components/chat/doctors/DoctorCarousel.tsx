import React from 'react';
import { motion } from 'framer-motion';
import { DoctorCard } from './DoctorCard';
import { mockDoctors } from '../../../utils/mockData';

interface DoctorCarouselProps {
  onBookConsultation: (doctorId: string) => void;
}

export function DoctorCarousel({ onBookConsultation }: DoctorCarouselProps) {
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
          <p className="text-sm text-white/80">Here are some recommended doctors for you:</p>
        </div>
      </motion.div>
      
      <div className="flex overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex space-x-0">
          {mockDoctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <DoctorCard
                doctor={doctor}
                onBookConsultation={onBookConsultation}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}