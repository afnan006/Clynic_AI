import React, { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Star, Clock, DollarSign } from 'lucide-react';
import { Doctor } from '../../../types';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Image } from '../../ui/Image';

interface DoctorCardProps {
  doctor: Doctor;
  onBookConsultation: (doctorId: string) => void;
}

export const DoctorCard = memo(function DoctorCard({ doctor, onBookConsultation }: DoctorCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const motionProps = shouldReduceMotion ? {} : {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    whileHover: { scale: 1.02, y: -2 },
    transition: { duration: 0.3 },
  };

  return (
    <motion.div
      {...motionProps}
      className="min-w-[280px] sm:min-w-[300px] mr-4 last:mr-0"
    >
      <Card hover gradient padding="md" className="h-full">
        <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-3">
          {/* Profile Image */}
          <div className="w-full sm:w-16 h-32 sm:h-16 flex-shrink-0">
            <Image
              src={doctor.profilePic}
              alt={`Dr. ${doctor.name}`}
              aspectRatio="square"
              className="rounded-2xl shadow-soft"
              fallback="https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=400"
            />
          </div>
          
          <div className="flex-1 min-w-0 w-full">
            {/* Name and Specialization */}
            <motion.h3
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={shouldReduceMotion ? {} : { opacity: 1 }}
              transition={shouldReduceMotion ? {} : { delay: 0.2 }}
              className="font-semibold text-white text-sm sm:text-base mb-1 truncate"
            >
              {doctor.name}
            </motion.h3>
            
            <motion.p
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={shouldReduceMotion ? {} : { opacity: 1 }}
              transition={shouldReduceMotion ? {} : { delay: 0.3 }}
              className="text-primary-400 text-xs sm:text-sm mb-3 truncate"
            >
              {doctor.specialization}
            </motion.p>
            
            {/* Stats */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs text-dark-300">
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                  <span>{doctor.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-dark-400 flex-shrink-0" />
                  <span>{doctor.experience} years</span>
                </div>
              </div>
              
              <div className="flex items-center text-xs text-success-400">
                <DollarSign className="w-3 h-3 mr-1 flex-shrink-0" />
                <span>${doctor.consultationFee}</span>
              </div>
            </div>
            
            {/* Book Button */}
            <Button
              onClick={() => onBookConsultation(doctor.id)}
              variant="primary"
              size="sm"
              fullWidth
              className="text-xs"
            >
              Book Consultation
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
});