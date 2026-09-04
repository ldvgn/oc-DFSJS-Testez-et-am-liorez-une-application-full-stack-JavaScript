import type { ReactNode } from "react";

type DescriptionItemProps = {
  label: string;
  children: ReactNode;
  /**
   * `"stacked"` (default): label above the value.
   * `"inline"`: label and value on the same line (`Label: value`).
   */
  layout?: "stacked" | "inline";
};

export function DescriptionItem({
  label,
  children,
  layout = "stacked",
}: DescriptionItemProps) {
  if (layout === "inline") {
    return (
      <div>
        <dt className="inline font-bold">{label}: </dt>
        <dd className="inline">{children}</dd>
      </div>
    );
  }

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <dt className="text-gray-600 text-sm font-semibold mb-1">{label}</dt>
      <dd className="text-lg text-gray-800">{children}</dd>
    </div>
  );
}
