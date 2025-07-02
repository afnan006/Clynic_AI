import React, { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ShoppingCart, Info } from 'lucide-react';
import { Medicine } from '../../../types';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Image } from '../../ui/Image';

interface MedicineCardProps {
  medicine: Medicine;
  onAddToCart: (medicineId: string) => void;
  onShowInfo: (medicineId: string) => void;
}

export const MedicineCard = memo(function MedicineCard({ 
  medicine, 
  onAddToCart, 
  onShowInfo 
}: MedicineCardProps) {
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
      className="min-w-[240px] sm:min-w-[260px] mr-4 last:mr-0"
    >
      <Card hover gradient padding="md" className="h-full">
        <div className="flex flex-col space-y-3">
          {/* Medicine Image */}
          <Image
            src={medicine.image}
            alt={medicine.name}
            aspectRatio="video"
            className="rounded-xl shadow-soft"
            fallback="https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400"
          />
          
          {/* Content */}
          <div className="flex-1 space-y-2">
            <motion.h3
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={shouldReduceMotion ? {} : { opacity: 1 }}
              transition={shouldReduceMotion ? {} : { delay: 0.2 }}
              className="font-semibold text-white text-sm line-clamp-1"
            >
              {medicine.name}
            </motion.h3>
            
            <motion.p
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={shouldReduceMotion ? {} : { opacity: 1 }}
              transition={shouldReduceMotion ? {} : { delay: 0.3 }}
              className="text-dark-300 text-xs line-clamp-2"
            >
              {medicine.description}
            </motion.p>
            
            <motion.p
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={shouldReduceMotion ? {} : { opacity: 1 }}
              transition={shouldReduceMotion ? {} : { delay: 0.4 }}
              className="text-success-400 font-semibold text-lg"
            >
              ${medicine.price}
            </motion.p>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              onClick={() => onAddToCart(medicine.id)}
              variant="primary"
              size="sm"
              className="flex-1 text-xs"
              leftIcon={<ShoppingCart size={14} />}
            >
              Add to Cart
            </Button>
            
            <Button
              onClick={() => onShowInfo(medicine.id)}
              variant="outline"
              size="sm"
              className="px-3"
              aria-label="Show medicine information"
            >
              <Info size={14} />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
});