import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
}

export function FormField({ label, htmlFor, children }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor={htmlFor}
        className="block text-gray-700 text-sm font-bold mb-2"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
