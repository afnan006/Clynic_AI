import { useState, useEffect, useCallback } from 'react';

interface UseImageLoaderOptions {
  src: string;
  fallback?: string;
  lazy?: boolean;
  threshold?: number;
}

interface ImageState {
  src: string | null;
  isLoading: boolean;
  hasError: boolean;
  isInView: boolean;
}

export function useImageLoader({
  src,
  fallback,
  lazy = false,
  threshold = 0.1,
}: UseImageLoaderOptions) {
  const [state, setState] = useState<ImageState>({
    src: lazy ? null : src,
    isLoading: !lazy,
    hasError: false,
    isInView: false,
  });

  const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || !imgRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState(prev => ({ ...prev, isInView: true }));
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(imgRef);

    return () => observer.disconnect();
  }, [imgRef, lazy, threshold]);

  // Load image when in view (for lazy loading) or immediately
  useEffect(() => {
    if (lazy && !state.isInView) return;

    setState(prev => ({ ...prev, isLoading: true, hasError: false }));

    const img = new Image();
    
    img.onload = () => {
      setState(prev => ({
        ...prev,
        src,
        isLoading: false,
        hasError: false,
      }));
    };

    img.onerror = () => {
      setState(prev => ({
        ...prev,
        src: fallback || null,
        isLoading: false,
        hasError: true,
      }));
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallback, lazy, state.isInView]);

  const ref = useCallback((node: HTMLImageElement | null) => {
    setImgRef(node);
  }, []);

  return {
    ...state,
    ref,
  };
}