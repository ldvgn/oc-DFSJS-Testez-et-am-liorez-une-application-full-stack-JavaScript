import { Link, type LinkProps } from "react-router-dom";

export type LinkVariant = "primary" | "inverted";

const VARIANT_CLASSES: Record<LinkVariant, string> = {
  primary: "text-indigo-600 hover:text-indigo-800",
  inverted: "text-white hover:text-indigo-200",
};

interface TextLinkProps extends LinkProps {
  /**
   * `"primary"` (default): indigo text, for a link on a light background.
   * `"inverted"`: white text, for a link on a dark background (e.g. navbar).
   */
  variant?: LinkVariant;
}

export function TextLink({
  variant = "primary",
  className,
  children,
  ...props
}: TextLinkProps) {
  return (
    <Link
      {...props}
      className={[VARIANT_CLASSES[variant], className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Link>
  );
}
