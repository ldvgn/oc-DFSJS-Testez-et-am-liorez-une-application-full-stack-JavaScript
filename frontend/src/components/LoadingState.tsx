interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex-1 justify-items-center content-center">
      <div className="text-xl text-gray-600">{label}</div>
    </div>
  );
}
