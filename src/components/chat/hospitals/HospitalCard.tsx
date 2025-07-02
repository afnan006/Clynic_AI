import React, { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Star, Phone, Navigation, Clock, Wifi, Car } from 'lucide-react';
import { Hospital } from '../../../types';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Image } from '../../ui/Image';

interface HospitalCardProps {
  hospital: Hospital;
  onGetDirections: (hospitalId: string) => void;
  onCall: (hospitalId: string) => void;
}

export const HospitalCard = memo(function HospitalCard({ 
  hospital, 
  onGetDirections, 
  onCall 
}: HospitalCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const motionProps = shouldReduceMotion ? {} : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    whileHover: { scale: 1.02, y: -2 },
    transition: { duration: 0.3 },
  };

  // Get distance color based on proximity
  const getDistanceColor = (distance: number) => {
    if (distance <= 2) return 'text-green-400';
    if (distance <= 5) return 'text-yellow-400';
    return 'text-orange-400';
  };

  // Get estimated travel time (rough calculation)
  const getEstimatedTime = (distance: number) => {
    // Assuming average city speed of 30 km/h
    const timeInHours = distance / 30;
    const timeInMinutes = Math.round(timeInHours * 60);
    
    if (timeInMinutes < 60) {
      return `${timeInMinutes} min`;
    } else {
      const hours = Math.floor(timeInMinutes / 60);
      const minutes = timeInMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  return (
    <motion.div
      {...motionProps}
      className="mb-4 last:mb-0"
    >
      <Card hover gradient padding="md" className="overflow-hidden">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Hospital Image */}
          <div className="w-full sm:w-24 h-32 sm:h-24 flex-shrink-0 relative">
            <Image
              src={hospital.image}
              alt={hospital.name}
              aspectRatio="video"
              className="rounded-2xl shadow-soft"
              fallback="https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=400"
            />
            
            {/* Distance Badge */}
            <div className="absolute top-2 right-2 bg-dark-900/80 backdrop-blur-sm px-2 py-1 rounded-lg">
              <span className={`text-xs font-medium ${getDistanceColor(hospital.distance)}`}>
                {hospital.distance} km
              </span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Hospital Name */}
            <motion.h3
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={shouldReduceMotion ? {} : { opacity: 1 }}
              transition={shouldReduceMotion ? {} : { delay: 0.2 }}
              className="font-semibold text-white text-base mb-2 line-clamp-1"
            >
              {hospital.name}
            </motion.h3>
            
            {/* Address */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={shouldReduceMotion ? {} : { opacity: 1 }}
              transition={shouldReduceMotion ? {} : { delay: 0.3 }}
              className="flex items-start text-dark-300 text-sm mb-3"
            >
              <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-primary-400" />
              <span className="line-clamp-2">{hospital.address}</span>
            </motion.div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {/* Rating */}
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <span className="text-yellow-400 text-sm font-medium">{hospital.rating}</span>
                <span className="text-dark-500 text-xs">rating</span>
              </div>
              
              {/* Travel Time */}
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-blue-400 text-sm font-medium">
                  {getEstimatedTime(hospital.distance)}
                </span>
                <span className="text-dark-500 text-xs">drive</span>
              </div>
              
              {/* Emergency Status */}
              <div className="flex items-center space-x-1 col-span-2 sm:col-span-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                <span className="text-green-400 text-sm font-medium">Open 24/7</span>
              </div>
            </div>

            {/* Services Icons */}
            <div className="flex items-center space-x-3 mb-4 text-dark-400">
              <div className="flex items-center space-x-1" title="Emergency Services">
                <span className="text-red-400">🚑</span>
                <span className="text-xs">Emergency</span>
              </div>
              <div className="flex items-center space-x-1" title="Parking Available">
                <Car className="w-3 h-3" />
                <span className="text-xs">Parking</span>
              </div>
              <div className="flex items-center space-x-1" title="WiFi Available">
                <Wifi className="w-3 h-3" />
                <span className="text-xs">WiFi</span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                onClick={() => onGetDirections(hospital.id)}
                variant="primary"
                size="sm"
                className="flex-1 text-xs"
                leftIcon={<Navigation size={14} />}
              >
                Get Directions
              </Button>
              
              <Button
                onClick={() => onCall(hospital.id)}
                variant="outline"
                size="sm"
                className="sm:px-4"
                leftIcon={<Phone size={14} />}
              >
                <span className="sm:hidden">Call Hospital</span>
                <span className="hidden sm:inline">Call</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Info Footer */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? {} : { delay: 0.4 }}
          className="mt-4 pt-3 border-t border-dark-700/50 flex items-center justify-between text-xs text-dark-400"
        >
          <span>📞 {hospital.phone}</span>
          <span className="flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            Lat: {hospital.lat.toFixed(4)}, Lng: {hospital.lng.toFixed(4)}
          </span>
        </motion.div>
      </Card>
    </motion.div>
  );
});