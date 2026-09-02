import { Link, type LinkProps } from "react-router-dom";
import { buttonClasses, type ButtonVariant } from "./Button";

interface LinkButtonProps extends LinkProps {
  variant?: ButtonVariant;
}

export function LinkButton({
  variant = "primary",
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link {...props} className={buttonClasses(variant, className)}>
      {children}
    </Link>
  );
}
