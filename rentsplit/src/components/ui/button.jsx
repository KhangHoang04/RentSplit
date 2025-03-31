import * as React from "react";

export const Button = React.forwardRef(
  ({ className = "", children, variant = "default", size = "default", ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
      ghost: "bg-transparent hover:bg-gray-100",
      destructive: "bg-red-500 text-white hover:bg-red-600"
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3",
      lg: "h-12 px-6"
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant] || ""} ${sizes[size] || ""} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
