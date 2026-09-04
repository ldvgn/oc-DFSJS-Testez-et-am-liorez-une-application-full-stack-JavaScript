interface AlertProps {
  message: string;
  className?: string;
}

export function Alert({ message, className }: AlertProps) {
  return (
    <div className="flex-1 justify-items-center content-center">
      <div
        className={[
          "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {message}
      </div>
    </div>
  );
}
