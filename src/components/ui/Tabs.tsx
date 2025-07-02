import React, { useState, useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export function Tabs({
  tabs,
  defaultTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className = '',
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const tabsRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variants = {
    default: {
      container: 'bg-dark-800/30 rounded-xl p-1',
      tab: 'rounded-lg transition-all duration-200',
      activeTab: 'bg-dark-700 text-white shadow-soft',
      inactiveTab: 'text-dark-400 hover:text-white hover:bg-dark-800/50',
    },
    pills: {
      container: 'space-x-2',
      tab: 'rounded-full transition-all duration-200',
      activeTab: 'bg-primary-500 text-white shadow-soft',
      inactiveTab: 'text-dark-400 hover:text-white hover:bg-dark-800/50',
    },
    underline: {
      container: 'border-b border-dark-700',
      tab: 'relative transition-all duration-200 border-b-2 border-transparent',
      activeTab: 'text-primary-400 border-primary-500',
      inactiveTab: 'text-dark-400 hover:text-white hover:border-dark-600',
    },
  };

  useEffect(() => {
    if (variant === 'underline' || !tabsRef.current) return;

    const activeTabElement = tabsRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
    if (activeTabElement) {
      setIndicatorStyle({
        width: activeTabElement.offsetWidth,
        left: activeTabElement.offsetLeft,
      });
    }
  }, [activeTab, variant]);

  const handleTabClick = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.disabled) return;

    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const handleKeyDown = (event: React.KeyboardEvent, tabId: string) => {
    const currentIndex = tabs.findIndex(tab => tab.id === tabId);
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        break;
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    const nextTab = tabs[nextIndex];
    if (!nextTab.disabled) {
      handleTabClick(nextTab.id);
      // Focus the next tab
      const nextTabElement = tabsRef.current?.querySelector(`[data-tab="${nextTab.id}"]`) as HTMLElement;
      nextTabElement?.focus();
    }
  };

  return (
    <div className={className}>
      {/* Tab List */}
      <div
        ref={tabsRef}
        className={`
          relative flex ${fullWidth ? 'w-full' : 'w-fit'}
          ${variants[variant].container}
        `}
        role="tablist"
        aria-orientation="horizontal"
      >
        {/* Background Indicator for default and pills variants */}
        {variant !== 'underline' && !shouldReduceMotion && (
          <motion.div
            className="absolute bg-white/10 rounded-lg"
            style={{
              height: 'calc(100% - 8px)',
              top: 4,
            }}
            animate={{
              width: indicatorStyle.width,
              left: indicatorStyle.left,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}

        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-tab={tab.id}
            onClick={() => handleTabClick(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab.id)}
            disabled={tab.disabled}
            className={`
              relative z-10 flex items-center space-x-2 font-medium
              focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-dark-900
              disabled:opacity-50 disabled:cursor-not-allowed
              ${variants[variant].tab}
              ${sizes[size]}
              ${fullWidth ? 'flex-1 justify-center' : ''}
              ${activeTab === tab.id 
                ? variants[variant].activeTab 
                : variants[variant].inactiveTab
              }
            `}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
          >
            {tab.icon && tab.icon}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="
                ml-2 px-2 py-0.5 text-xs font-semibold rounded-full
                bg-primary-500/20 text-primary-400
              ">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mt-6"
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={activeTab}
      >
        {activeTabContent}
      </motion.div>
    </div>
  );
}