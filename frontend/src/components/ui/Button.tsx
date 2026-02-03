import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseClass = "button";
  const variantClass = `button--${variant}`;
  const sizeClass = `button--${size}`;
  const stateClass = disabled || loading ? "button--disabled" : "";
  const loadingClass = loading ? "button--loading" : "";
  const widthClass = fullWidth ? "button--full-width" : "";

  const combinedClasses = [
    baseClass,
    variantClass,
    sizeClass,
    stateClass,
    loadingClass,
    widthClass,
    className
  ].filter(Boolean).join(" ");

  return (
    <button
      className={combinedClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="button__spinner" aria-label="Loading">
          <svg className="button__spinner-svg" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
            <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" opacity="0.75" />
          </svg>
        </span>
      )}
      {icon && !loading && <span className="button__icon">{icon}</span>}
      <span className="button__content">{children}</span>
    </button>
  );
}