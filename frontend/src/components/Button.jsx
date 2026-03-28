const variants = {
  primary:
    "bg-[var(--color-cyan-deep)] text-white shadow-[0_16px_32px_rgba(45,124,119,0.18)] hover:bg-[var(--color-cyan)] focus-visible:ring-[var(--color-cyan)]",
  secondary:
    "border border-[var(--color-line)] bg-[var(--color-paper)] text-[var(--color-cyan-deep)] hover:bg-[var(--color-cyan-soft)] focus-visible:ring-[var(--color-cyan)]",
  ghost:
    "border border-[rgba(138,102,72,0.26)] bg-transparent text-[var(--color-wood-deep)] hover:border-[var(--color-wood)] hover:bg-[rgba(138,102,72,0.08)] focus-visible:ring-[var(--color-wood)]",
  light:
    "bg-[var(--color-paper-soft)] text-[var(--color-ink)] hover:bg-white focus-visible:ring-[var(--color-cyan)]",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-sm sm:text-base",
  lg: "px-6 py-3.5 text-base",
};

export default function Button({
  children,
  className = "",
  fullWidth = false,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
