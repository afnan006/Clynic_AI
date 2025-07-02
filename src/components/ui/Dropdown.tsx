import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled';
  className?: string;
}

export function Dropdown({
  options,
  value,
  placeholder = 'Select an option',
  onSelect,
  disabled = false,
  error,
  label,
  size = 'md',
  variant = 'default',
  className = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const selectedOption = options.find(option => option.value === value);

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  const variants = {
    default: `
      bg-dark-800/50 border border-dark-700 hover:border-dark-600
      focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
    `,
    filled: `
      bg-dark-800 border-0 hover:bg-dark-700/70
      focus:ring-2 focus:ring-primary-500/20
    `,
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          const option = options[focusedIndex];
          if (!option.disabled) {
            onSelect(option.value);
            setIsOpen(false);
            setFocusedIndex(-1);
          }
        } else {
          setIsOpen(true);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const nextIndex = focusedIndex < options.length - 1 ? focusedIndex + 1 : 0;
          setFocusedIndex(nextIndex);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const prevIndex = focusedIndex > 0 ? focusedIndex - 1 : options.length - 1;
          setFocusedIndex(prevIndex);
        }
        break;
    }
  };

  const handleOptionClick = (option: DropdownOption) => {
    if (option.disabled) return;
    onSelect(option.value);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const dropdownVariants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : {
      opacity: 0,
      y: -10,
      scale: 0.95,
    },
    visible: shouldReduceMotion ? { opacity: 1 } : {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className={`block text-sm font-medium mb-2 ${error ? 'text-error-400' : 'text-dark-300'}`}>
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between rounded-xl text-white
          transition-all duration-200 focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]}
          ${sizes[size]}
          ${error ? 'border-error-500 focus:ring-error-500/20 focus:border-error-500' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? undefined : 'dropdown-label'}
      >
        <div className="flex items-center space-x-2">
          {selectedOption?.icon && selectedOption.icon}
          <span className={selectedOption ? 'text-white' : 'text-dark-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown 
          size={20} 
          className={`text-dark-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="
              absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-700 
              rounded-xl shadow-soft-lg backdrop-blur-xl z-50 overflow-hidden
            "
            role="listbox"
          >
            {options.map((option, index) => (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => handleOptionClick(option)}
                onMouseEnter={() => setFocusedIndex(index)}
                className={`
                  w-full flex items-center justify-between px-4 py-3 text-left
                  transition-colors duration-150 focus:outline-none
                  ${option.disabled 
                    ? 'text-dark-500 cursor-not-allowed' 
                    : 'text-white hover:bg-dark-700/50'
                  }
                  ${focusedIndex === index ? 'bg-dark-700/50' : ''}
                  ${selectedOption?.value === option.value ? 'bg-primary-500/10 text-primary-400' : ''}
                `}
                disabled={option.disabled}
                role="option"
                aria-selected={selectedOption?.value === option.value}
              >
                <div className="flex items-center space-x-2">
                  {option.icon && option.icon}
                  <span>{option.label}</span>
                </div>
                {selectedOption?.value === option.value && (
                  <Check size={16} className="text-primary-400" />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={shouldReduceMotion ? {} : { opacity: 0, y: -5 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          className="text-sm text-error-400 mt-2"
          role="alert"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}