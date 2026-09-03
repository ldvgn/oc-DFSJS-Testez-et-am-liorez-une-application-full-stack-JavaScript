import { ElementType, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** HTML element the card is rendered as (`div` by default). */
  as?: ElementType;
}

export function Card({
  children,
  className,
  as: Component = "div",
}: CardProps) {
  return (
    <Component
      className={["bg-white rounded-lg shadow-md p-8", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Component>
  );
}
