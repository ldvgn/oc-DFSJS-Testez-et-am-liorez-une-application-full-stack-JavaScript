import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "danger" | "secondary" | "success";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  secondary: "bg-gray-300 hover:bg-gray-400 text-gray-700",
  success: "bg-emerald-600 hover:bg-emerald-700 text-white",
};

const BASE_CLASSES = "py-2 px-4 rounded-lg disabled:bg-gray-400";

/**
 * Construit la liste de classes CSS d'un bouton, partagée par `Button` et `LinkButton`.
 *
 * @param variant - Style visuel du bouton (couleur).
 * @param className - Classes supplémentaires ajoutées par l'appelant.
 * @returns La chaîne de classes finale (base + variante + `className`).
 */
export function buttonClasses(variant: ButtonVariant, className?: string) {
  return [BASE_CLASSES, VARIANT_CLASSES[variant], className]
    .filter(Boolean)
    .join(" ");
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  variant = "primary",
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={buttonClasses(variant, className)}
    >
      {children}
    </button>
  );
}
