import React, { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useImageLoader } from '../../hooks/useImageLoader';
import { SkeletonLoader } from './LoadingSpinner';

interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  fallback?: string;
  lazy?: boolean;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  placeholder?: 'skeleton' | 'blur' | 'none';
  onLoad?: () => void;
  onError?: () => void;
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(({
  src,
  alt,
  fallback,
  lazy = true,
  aspectRatio,
  objectFit = 'cover',
  placeholder = 'skeleton',
  className = '',
  onLoad,
  onError,
  ...props
}, forwardedRef) => {
  const shouldReduceMotion = useReducedMotion();
  const { src: loadedSrc, isLoading, hasError, ref } = useImageLoader({
    src,
    fallback,
    lazy,
  });

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  };

  const objectFitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down',
  };

  const handleLoad = () => {
    onLoad?.();
  };

  const handleError = () => {
    onError?.();
  };

  const motionProps = shouldReduceMotion ? {} : {
    initial: { opacity: 0 },
    animate: { opacity: loadedSrc ? 1 : 0 },
    transition: { duration: 0.3 },
  };

  return (
    <div 
      className={`
        relative overflow-hidden
        ${aspectRatio && typeof aspectRatio === 'string' && aspectRatioClasses[aspectRatio as keyof typeof aspectRatioClasses] 
          ? aspectRatioClasses[aspectRatio as keyof typeof aspectRatioClasses]
          : aspectRatio && !aspectRatioClasses[aspectRatio as keyof typeof aspectRatioClasses]
          ? `aspect-[${aspectRatio}]`
          : ''
        }
        ${className}
      `}
    >
      {/* Placeholder */}
      {isLoading && placeholder !== 'none' && (
        <div className="absolute inset-0">
          {placeholder === 'skeleton' && (
            <SkeletonLoader className="w-full h-full" />
          )}
          {placeholder === 'blur' && (
            <div className="w-full h-full bg-dark-800/50 backdrop-blur-sm animate-pulse" />
          )}
        </div>
      )}

      {/* Image */}
      {loadedSrc && (
        <motion.img
          {...motionProps}
          ref={(node) => {
            ref(node);
            if (typeof forwardedRef === 'function') {
              forwardedRef(node);
            } else if (forwardedRef) {
              forwardedRef.current = node;
            }
          }}
          src={loadedSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            w-full h-full ${objectFitClasses[objectFit]}
            ${isLoading ? 'opacity-0' : 'opacity-100'}
            transition-opacity duration-300
          `}
          loading={lazy ? 'lazy' : 'eager'}
          {...props}
        />
      )}

      {/* Error State */}
      {hasError && !fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-800/50 text-dark-400">
          <div className="text-center">
            <div className="text-2xl mb-2">🖼️</div>
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  );
});

Image.displayName = 'Image';