import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-plum/20 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "bg-plum text-white hover:bg-plum/90",
    secondary: "border border-plum text-plum bg-white hover:bg-plum/5",
    danger: "bg-rose text-white hover:bg-rose/90",
    ghost: "text-plum hover:bg-plum/5",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
