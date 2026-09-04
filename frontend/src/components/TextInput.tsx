export function TextInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
