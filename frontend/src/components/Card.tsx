import { ElementType, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
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
