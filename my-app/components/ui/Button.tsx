import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type SharedProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
};

type ButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type LinkProps = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export function Button(props: ButtonProps | LinkProps) {
  const {
    children,
    variant = "primary",
    size = "md",
    className = "",
    ...rest
  } = props;

  const variantClasses = {
    primary:
      "bg-[var(--primary-500)] text-white shadow-[0_14px_35px_rgba(30,94,255,0.35)] hover:bg-[var(--primary-500)]/90",
    secondary:
      "border border-white/15 bg-white/5 text-white hover:bg-white/10",
    ghost:
      "text-[var(--soft-white)] hover:bg-white/5",
  };

  const sizeClasses = {
    sm: "h-10 px-4 text-sm",
    md: "h-12 px-5 text-sm",
    lg: "h-14 px-6 text-base",
  };

  const classes = [
    "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan-400)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy-950)]",
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if ("href" in props && props.href) {
    const anchorProps = rest as AnchorHTMLAttributes<HTMLAnchorElement>;

    return (
      <a className={classes} {...anchorProps}>
        {children}
      </a>
    );
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button type="button" className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
