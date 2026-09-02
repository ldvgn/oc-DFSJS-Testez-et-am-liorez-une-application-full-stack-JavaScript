import type { ReactNode } from "react";

export type BadgeVariant = "purple" | "blue" | "green" | "gray";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  purple: "bg-purple-100 text-purple-800",
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  gray: "bg-gray-100 text-gray-800",
};

const BASE_CLASSES =
  "inline-block px-3 py-1 rounded-full text-sm font-semibold";

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}

export function Badge({ variant = "gray", className, children }: BadgeProps) {
  return (
    <span
      className={[BASE_CLASSES, VARIANT_CLASSES[variant], className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
