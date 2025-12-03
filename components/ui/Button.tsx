"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-[var(--primary)] text-white hover:bg-indigo-700 focus:ring-[var(--primary)]",
      secondary:
        "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-slate-200 focus:ring-slate-400",
      outline:
        "border-2 border-[var(--border)] bg-transparent hover:bg-[var(--muted)] focus:ring-[var(--primary)]",
      ghost:
        "bg-transparent hover:bg-[var(--muted)] focus:ring-[var(--primary)]",
      destructive:
        "bg-[var(--destructive)] text-white hover:bg-red-600 focus:ring-[var(--destructive)]",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="spinner mr-2" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

