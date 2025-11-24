/**
 * EnhancedInput Component
 * 
 * Provides enhanced UX for input fields with better styling,
 * focus states, and user feedback.
 */

import { Input, InputProps } from "antd";
import { useState } from "react";

interface EnhancedInputProps extends InputProps {
  /** Whether the input is in editing mode */
  isEditing?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Custom focus handler */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** Custom blur handler */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

interface EnhancedTextAreaProps {
  /** Whether the textarea is in editing mode */
  isEditing?: boolean;
  /** Whether the textarea is disabled */
  disabled?: boolean;
  /** Custom focus handler */
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  /** Custom blur handler */
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Auto size the textarea */
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  /** Click handler */
  onClick?: (e: React.MouseEvent<HTMLTextAreaElement>) => void;
  /** Style object */
  style?: React.CSSProperties;
  /** All other props */
  [key: string]: any;
}

/**
 * Enhanced input component with improved UX
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export const EnhancedInput: React.FC<EnhancedInputProps> = ({
  isEditing = false,
  disabled = false,
  onFocus,
  onBlur,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const enhancedStyle = {
    ...style,
    border: isEditing
      ? "2px solid #1890ff"
      : isFocused
        ? "2px solid #40a9ff"
        : "1px solid #d9d9d9",
    borderRadius: "6px",
    transition: "all 0.2s ease-in-out",
    boxShadow: isEditing
      ? "0 0 0 2px rgba(24, 144, 255, 0.1)"
      : isFocused
        ? "0 0 0 2px rgba(24, 144, 255, 0.05)"
        : "none",
    backgroundColor: disabled ? "#f5f5f5" : "#ffffff",
    opacity: disabled ? 0.6 : 1,
  };

  return (
    <Input
      {...props}
      style={enhancedStyle}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
    />
  );
};

/**
 * Enhanced textarea component with improved UX
 */
export const EnhancedTextArea: React.FC<EnhancedTextAreaProps> = ({
  isEditing = false,
  disabled = false,
  onFocus,
  onBlur,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const enhancedStyle = {
    ...style,
    border: isEditing
      ? "2px solid #1890ff"
      : isFocused
        ? "2px solid #40a9ff"
        : "1px solid #d9d9d9",
    borderRadius: "6px",
    transition: "all 0.2s ease-in-out",
    boxShadow: isEditing
      ? "0 0 0 2px rgba(24, 144, 255, 0.1)"
      : isFocused
        ? "0 0 0 2px rgba(24, 144, 255, 0.05)"
        : "none",
    backgroundColor: disabled ? "#f5f5f5" : "#ffffff",
    opacity: disabled ? 0.6 : 1,
    resize: "none" as const,
  };

  return (
    <Input.TextArea
      {...props}
      style={enhancedStyle}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
    />
  );
};

export default EnhancedInput;
