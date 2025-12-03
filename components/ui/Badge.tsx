import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const variants = {
      default:
        "bg-[var(--secondary)] text-[var(--secondary-foreground)]",
      success:
        "bg-emerald-50 text-emerald-700 border border-emerald-200",
      warning:
        "bg-amber-50 text-amber-700 border border-amber-200",
      danger:
        "bg-red-50 text-red-700 border border-red-200",
      info:
        "bg-blue-50 text-blue-700 border border-blue-200",
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;

