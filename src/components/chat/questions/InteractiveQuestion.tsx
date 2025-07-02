import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Send, Clock, MapPin, Thermometer } from 'lucide-react';
import { QuestionData, QuestionOption } from '../../../types';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

interface InteractiveQuestionProps {
  questionData: QuestionData;
  onAnswer: (value: string | string[]) => void;
  className?: string;
}

export function InteractiveQuestion({ 
  questionData, 
  onAnswer, 
  className = '' 
}: InteractiveQuestionProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textInput, setTextInput] = useState('');
  const shouldReduceMotion = useReducedMotion();

  const logToConsole = (action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('INTERACTIVE_QUESTION', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level);
    }
  };

  const handleOptionClick = (option: QuestionOption) => {
    const { questionType = 'single_choice' } = questionData;
    
    if (questionType === 'single_choice') {
      // For single choice, immediately send the answer
      logToConsole('Single Choice Selected', {
        question: questionData.text.substring(0, 50),
        selectedOption: option.label,
        value: option.value
      }, 'info');
      
      onAnswer(option.value);
    } else if (questionType === 'multiple_choice') {
      // For multiple choice, toggle selection
      const newSelection = selectedOptions.includes(option.value)
        ? selectedOptions.filter(val => val !== option.value)
        : [...selectedOptions, option.value];
      
      setSelectedOptions(newSelection);
      
      logToConsole('Multiple Choice Updated', {
        question: questionData.text.substring(0, 50),
        selectedOptions: newSelection,
        optionToggled: option.label
      }, 'info');
    }
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    
    logToConsole('Text Input Submitted', {
      question: questionData.text.substring(0, 50),
      inputLength: textInput.length,
      value: textInput.substring(0, 50)
    }, 'info');
    
    onAnswer(textInput.trim());
  };

  const handleMultipleChoiceSubmit = () => {
    if (selectedOptions.length === 0) return;
    
    logToConsole('Multiple Choice Submitted', {
      question: questionData.text.substring(0, 50),
      selectedCount: selectedOptions.length,
      values: selectedOptions
    }, 'info');
    
    onAnswer(selectedOptions);
  };

  const getOptionIcon = (option: QuestionOption) => {
    if (option.icon) {
      // Handle emoji icons
      if (option.icon.length <= 2) {
        return <span className="text-lg">{option.icon}</span>;
      }
      
      // Handle lucide icon names
      switch (option.icon.toLowerCase()) {
        case 'clock':
          return <Clock className="w-4 h-4" />;
        case 'mappin':
          return <MapPin className="w-4 h-4" />;
        case 'thermometer':
          return <Thermometer className="w-4 h-4" />;
        default:
          return null;
      }
    }
    return null;
  };

  // Predefined color class mappings to avoid dynamic class generation
  const getOptionColor = (option: QuestionOption, isSelected: boolean) => {
    // Base classes for all options
    let baseClasses = "flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium text-sm";
    
    // Selected state classes
    if (isSelected) {
      if (option.color === 'orange') {
        return `${baseClasses} bg-orange-500 border-orange-500 text-white`;
      } else if (option.color === 'blue') {
        return `${baseClasses} bg-blue-500 border-blue-500 text-white`;
      } else if (option.color === 'green') {
        return `${baseClasses} bg-green-500 border-green-500 text-white`;
      } else if (option.color === 'red') {
        return `${baseClasses} bg-red-500 border-red-500 text-white`;
      } else if (option.color === 'yellow') {
        return `${baseClasses} bg-yellow-500 border-yellow-500 text-white`;
      } else if (option.color === 'purple') {
        return `${baseClasses} bg-purple-500 border-purple-500 text-white`;
      } else {
        return `${baseClasses} bg-primary-500 border-primary-500 text-white`;
      }
    }
    
    // Unselected state classes
    if (option.color === 'orange') {
      return `${baseClasses} bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20 hover:border-orange-500 text-orange-300 hover:text-orange-200`;
    } else if (option.color === 'blue') {
      return `${baseClasses} bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500 text-blue-300 hover:text-blue-200`;
    } else if (option.color === 'green') {
      return `${baseClasses} bg-green-500/10 border-green-500/30 hover:bg-green-500/20 hover:border-green-500 text-green-300 hover:text-green-200`;
    } else if (option.color === 'red') {
      return `${baseClasses} bg-red-500/10 border-red-500/30 hover:bg-red-500/20 hover:border-red-500 text-red-300 hover:text-red-200`;
    } else if (option.color === 'yellow') {
      return `${baseClasses} bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20 hover:border-yellow-500 text-yellow-300 hover:text-yellow-200`;
    } else if (option.color === 'purple') {
      return `${baseClasses} bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500 text-purple-300 hover:text-purple-200`;
    } else {
      return `${baseClasses} bg-primary-500/10 border-primary-500/30 hover:bg-primary-500/20 hover:border-primary-500 text-primary-300 hover:text-primary-200`;
    }
  };

  const { questionType = 'single_choice' } = questionData;

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`mb-4 ${className}`}
    >
      <Card className="p-4 bg-dark-800/60 backdrop-blur-xl border-dark-700/50">
        {/* Question Text */}
        <div className="mb-4">
          <h4 className="text-white font-medium text-base leading-relaxed">
            {questionData.text}
          </h4>
          
          {/* Context Information */}
          {questionData.context && (
            <div className="mt-2 text-sm text-dark-400">
              {questionData.context.temperature && (
                <span className="inline-flex items-center space-x-1">
                  <Thermometer className="w-3 h-3" />
                  <span>Temperature outside: {questionData.context.temperature}°C</span>
                </span>
              )}
              {questionData.context.location && (
                <span className="inline-flex items-center space-x-1 ml-4">
                  <MapPin className="w-3 h-3" />
                  <span>{questionData.context.location}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Question Type: Text Input */}
        {questionType === 'text_input' && (
          <div className="space-y-3">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={questionData.placeholder || 'Type your answer...'}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleTextSubmit();
                }
              }}
              className="bg-dark-700/50 border-dark-600"
            />
            <Button
              onClick={handleTextSubmit}
              disabled={!textInput.trim()}
              variant="primary"
              size="sm"
              leftIcon={<Send />}
              className="ml-auto"
            >
              Send
            </Button>
          </div>
        )}

        {/* Question Type: Single/Multiple Choice */}
        {(questionType === 'single_choice' || questionType === 'multiple_choice') && (
          <div className="space-y-3">
            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {questionData.options.map((option, index) => {
                const isSelected = selectedOptions.includes(option.value);
                
                return (
                  <motion.button
                    key={option.value}
                    initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
                    animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                    transition={shouldReduceMotion ? {} : { delay: index * 0.1 }}
                    whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                    onClick={() => handleOptionClick(option)}
                    className={`
                      ${getOptionColor(option, isSelected)}
                      focus:outline-none focus:ring-2 focus:ring-primary-500/50
                    `}
                  >
                    {getOptionIcon(option)}
                    <span>{option.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Submit Button for Multiple Choice */}
            {questionType === 'multiple_choice' && selectedOptions.length > 0 && (
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                className="flex justify-end"
              >
                <Button
                  onClick={handleMultipleChoiceSubmit}
                  variant="primary"
                  size="sm"
                  leftIcon={<Send />}
                >
                  Submit ({selectedOptions.length} selected)
                </Button>
              </motion.div>
            )}
          </div>
        )}

        {/* Required Indicator */}
        {questionData.required && (
          <p className="text-xs text-dark-500 mt-2">
            * This question is required
          </p>
        )}
      </Card>
    </motion.div>
  );
}