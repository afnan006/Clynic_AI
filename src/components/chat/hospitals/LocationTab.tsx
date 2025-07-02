import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Navigation, Phone, Star, Clock, AlertCircle, Loader2, Target, Crosshair } from 'lucide-react';
import { HospitalCard } from './HospitalCard';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Alert } from '../../ui/Alert';
import { mockHospitals } from '../../../utils/mockData';
import { Hospital } from '../../../types';

interface LocationTabProps {
  onGetDirections: (hospitalId: string) => void;
  onCall: (hospitalId: string) => void;
}

// Mock Google Maps component for demonstration
const MockGoogleMap = ({ 
  center, 
  zoom, 
  hospitals, 
  userLocation, 
  onMarkerClick,
  className = ""
}: {
  center: { lat: number; lng: number };
  zoom: number;
  hospitals: Hospital[];
  userLocation: { lat: number; lng: number } | null;
  onMarkerClick: (hospital: Hospital) => void;
  className?: string;
}) => {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  return (
    <div className={`relative w-full h-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-xl overflow-hidden ${className}`}>
      {/* Map Background with Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center hover:bg-white transition-colors">
          <span className="text-gray-700 font-bold text-lg">+</span>
        </button>
        <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center hover:bg-white transition-colors">
          <span className="text-gray-700 font-bold text-lg">−</span>
        </button>
        <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center hover:bg-white transition-colors">
          <Target className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* User Location Marker */}
      {userLocation && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute z-20"
          style={{
            left: '45%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="relative">
            {/* Pulsing circle */}
            <div className="absolute inset-0 w-8 h-8 bg-blue-500/30 rounded-full animate-ping" />
            {/* Main dot */}
            <div className="relative w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg" />
          </div>
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            You are here
          </div>
        </motion.div>
      )}

      {/* Hospital Markers */}
      {hospitals.map((hospital, index) => {
        const positions = [
          { left: '30%', top: '35%' },
          { left: '60%', top: '25%' },
          { left: '25%', top: '70%' },
          { left: '70%', top: '65%' },
          { left: '50%', top: '80%' }
        ];
        const position = positions[index % positions.length];

        return (
          <motion.div
            key={hospital.id}
            initial={{ scale: 0, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            className="absolute z-10 cursor-pointer"
            style={position}
            onClick={() => {
              setSelectedHospital(selectedHospital?.id === hospital.id ? null : hospital);
              onMarkerClick(hospital);
            }}
          >
            {/* Hospital Marker */}
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
              >
                <span className="text-white text-xs font-bold">H</span>
              </motion.div>
              
              {/* Info Window */}
              {selectedHospital?.id === hospital.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white rounded-lg shadow-xl border p-3 z-30"
                >
                  <div className="text-gray-900">
                    <h4 className="font-semibold text-sm mb-1">{hospital.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{hospital.address}</p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-500 mr-1" />
                          <span>{hospital.rating}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 text-gray-500 mr-1" />
                          <span>{hospital.distance} km</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle directions
                        }}
                        className="flex-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        Directions
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle call
                        }}
                        className="flex-1 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                      >
                        Call
                      </button>
                    </div>
                  </div>
                  {/* Arrow pointing down */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
                </motion.div>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Map Attribution */}
      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-600">
        Mock Google Maps
      </div>
    </div>
  );
};

export function LocationTab({ onGetDirections, onCall }: LocationTabProps) {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const logToConsole = useCallback((action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('LOCATION_TAB', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level);
    }
  }, []);

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      const error = 'Geolocation is not supported by this browser';
      setLocationError(error);
      logToConsole('Geolocation Not Supported', {}, 'warn');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setUserLocation(location);
        setMapCenter(location);
        setIsLoadingLocation(false);
        
        logToConsole('User Location Retrieved', {
          lat: location.lat,
          lng: location.lng,
          accuracy: position.coords.accuracy
        }, 'success');
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services to find nearby hospitals.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        setLocationError(errorMessage);
        setIsLoadingLocation(false);
        
        logToConsole('Geolocation Error', {
          code: error.code,
          message: error.message,
          errorMessage
        }, 'error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, [logToConsole]);

  // Auto-request location when component mounts
  useEffect(() => {
    if (!hasRequestedLocation) {
      setHasRequestedLocation(true);
      // Small delay to let the component render first
      setTimeout(() => {
        getCurrentLocation();
      }, 500);
    }
  }, [getCurrentLocation, hasRequestedLocation]);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Sort hospitals by distance from user location
  const sortedHospitals = useMemo(() => {
    if (!userLocation) return mockHospitals;
    
    return [...mockHospitals].sort((a, b) => {
      const distanceA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distanceB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distanceA - distanceB;
    });
  }, [userLocation, calculateDistance]);

  // Handle marker click
  const handleMarkerClick = useCallback((hospital: Hospital) => {
    setSelectedHospital(hospital);
    logToConsole('Hospital Marker Clicked', {
      hospitalId: hospital.id,
      hospitalName: hospital.name
    }, 'info');
  }, [logToConsole]);

  // Handle directions click
  const handleDirectionsClick = useCallback((hospitalId: string) => {
    const hospital = mockHospitals.find(h => h.id === hospitalId);
    if (hospital) {
      // Open Google Maps directions
      const destination = `${hospital.lat},${hospital.lng}`;
      const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
      const url = `https://www.google.com/maps/dir/${origin}/${destination}`;
      
      window.open(url, '_blank');
      
      logToConsole('Directions Opened', {
        hospitalId,
        hospitalName: hospital.name,
        hasUserLocation: !!userLocation
      }, 'info');
    }
    
    onGetDirections(hospitalId);
  }, [userLocation, onGetDirections, logToConsole]);

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      className="mb-4"
    >
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0 }}
        animate={shouldReduceMotion ? {} : { opacity: 1 }}
        transition={shouldReduceMotion ? {} : { delay: 0.2 }}
        className="flex justify-start mb-3"
      >
        <div className="px-2 py-1">
          <p className="text-sm text-white/80">Here are the nearest hospitals to your location:</p>
        </div>
      </motion.div>

      {/* Location Status Card */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
        transition={shouldReduceMotion ? {} : { delay: 0.3 }}
        className="mb-4"
      >
        <Card variant="outlined" className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${
                userLocation ? 'bg-green-500/20' : isLoadingLocation ? 'bg-yellow-500/20' : 'bg-gray-500/20'
              }`}>
                {isLoadingLocation ? (
                  <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                ) : userLocation ? (
                  <Crosshair className="w-5 h-5 text-green-400" />
                ) : (
                  <MapPin className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div>
                <span className="text-white font-medium">
                  {isLoadingLocation ? 'Locating...' : userLocation ? 'Location Found' : 'Location Services'}
                </span>
                {userLocation && (
                  <p className="text-xs text-green-400 mt-1">
                    📍 Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {userLocation && (
                <span className="text-success-400 text-sm">📍 Located</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isLoadingLocation}
                leftIcon={isLoadingLocation ? <Loader2 className="animate-spin" /> : <Navigation />}
              >
                {isLoadingLocation ? 'Locating...' : userLocation ? 'Update Location' : 'Find My Location'}
              </Button>
            </div>
          </div>
          
          {locationError && (
            <Alert
              variant="warning"
              description={locationError}
              className="mb-3"
              dismissible
              onDismiss={() => setLocationError('')}
            />
          )}
        </Card>
      </motion.div>

      {/* Mock Google Map */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
        transition={shouldReduceMotion ? {} : { delay: 0.4 }}
        className="mb-4"
      >
        <Card variant="outlined" className="p-2 sm:p-4">
          <div className="h-64 sm:h-80 lg:h-96 rounded-xl overflow-hidden">
            <MockGoogleMap
              center={mapCenter}
              zoom={userLocation ? 13 : 11}
              hospitals={sortedHospitals}
              userLocation={userLocation}
              onMarkerClick={handleMarkerClick}
              className="w-full h-full"
            />
          </div>
          
          {/* Map Info */}
          <div className="mt-3 flex items-center justify-between text-xs text-dark-400">
            <span>🗺️ Interactive hospital map</span>
            <span>{sortedHospitals.length} hospitals found</span>
          </div>
        </Card>
      </motion.div>

      {/* Hospital List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium">Nearby Hospitals</h3>
          <span className="text-xs text-dark-400">
            {userLocation ? 'Sorted by distance' : 'Default order'}
          </span>
        </div>
        
        {sortedHospitals.map((hospital, index) => {
          // Calculate real-time distance if user location is available
          const realTimeDistance = userLocation 
            ? calculateDistance(userLocation.lat, userLocation.lng, hospital.lat, hospital.lng)
            : hospital.distance;

          const hospitalWithDistance = {
            ...hospital,
            distance: Math.round(realTimeDistance * 10) / 10 // Round to 1 decimal place
          };

          return (
            <motion.div
              key={hospital.id}
              initial={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
              transition={shouldReduceMotion ? {} : { delay: 0.5 + index * 0.1 }}
            >
              <HospitalCard
                hospital={hospitalWithDistance}
                onGetDirections={handleDirectionsClick}
                onCall={onCall}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}