import { useState, useEffect } from 'react';

interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
}

const defaultBreakpoints: BreakpointConfig = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1600,
};

export function useResponsive(breakpoints: Partial<BreakpointConfig> = {}) {
  const bp = { ...defaultBreakpoints, ...breakpoints };
  
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isXs = windowSize.width >= bp.xs;
  const isSm = windowSize.width >= bp.sm;
  const isMd = windowSize.width >= bp.md;
  const isLg = windowSize.width >= bp.lg;
  const isXl = windowSize.width >= bp.xl;
  const is2Xl = windowSize.width >= bp['2xl'];
  const is3Xl = windowSize.width >= bp['3xl'];

  const currentBreakpoint = 
    is3Xl ? '3xl' :
    is2Xl ? '2xl' :
    isXl ? 'xl' :
    isLg ? 'lg' :
    isMd ? 'md' :
    isSm ? 'sm' :
    isXs ? 'xs' : 'base';

  return {
    windowSize,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    is3Xl,
    currentBreakpoint,
    isMobile: !isSm,
    isTablet: isSm && !isLg,
    isDesktop: isLg,
  };
}