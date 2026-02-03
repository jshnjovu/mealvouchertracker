import { ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = "neutral",
  size = "md",
  icon,
  children,
  className = ""
}: BadgeProps) {
  const variantClass = `badge--${variant}`;
  const sizeClass = `badge--${size}`;
  const combinedClasses = `badge ${variantClass} ${sizeClass} ${className}`.trim();

  return (
    <span className={combinedClasses}>
      {icon && <span className="badge__icon">{icon}</span>}
      {children}
    </span>
  );
}
