import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = "secondary", className, type = "button", ...rest }: ButtonProps) {
  const classes = ["ds-button", `ds-button-${variant}`, className].filter(Boolean).join(" ");
  return <button type={type} className={classes} {...rest} />;
}
