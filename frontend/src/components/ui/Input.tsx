import { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  success?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  fullWidth = false,
  success = false,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).slice(2)}`;
  const errorClass = error ? "input-field--error" : "";
  const successClass = success && !error ? "input-field--success" : "";
  const widthClass = fullWidth ? "input-wrapper--full-width" : "";

  return (
    <div className={`input-wrapper ${widthClass}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input-field ${errorClass} ${successClass} ${className}`}
        aria-invalid={!!error}
        aria-describedby={
          error || helperText ? `${inputId}-helper` : undefined
        }
        {...props}
      />
      {helperText && !error && (
        <span id={`${inputId}-helper`} className="input-helper">
          {helperText}
        </span>
      )}
      {error && (
        <span id={`${inputId}-helper`} className="input-error">
          {error}
        </span>
      )}
    </div>
  );
}
