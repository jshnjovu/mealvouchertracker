import { ReactNode } from "react";

type CardVariant = "default" | "elevated" | "glass";

interface CardProps {
  variant?: CardVariant;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
}

export function Card({
  variant = "default",
  title,
  subtitle,
  children,
  className = "",
  header,
  footer
}: CardProps) {
  const variantClass = variant === "default" ? "" : `card--${variant}`;
  const combinedClasses = `card ${variantClass} ${className}`.trim();

  return (
    <div className={combinedClasses}>
      {(title || subtitle || header) && (
        <div className="card__header">
          {header || (
            <>
              {title && <h3 className="card__title">{title}</h3>}
              {subtitle && <p className="card__subtitle">{subtitle}</p>}
            </>
          )}
        </div>
      )}
      <div className="card__body">{children}</div>
      {footer && <div className="card__footer">{footer}</div>}
    </div>
  );
}
