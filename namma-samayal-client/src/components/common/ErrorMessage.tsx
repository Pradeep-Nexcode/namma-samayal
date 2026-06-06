interface ErrorMessageProps {
  message?: string;
}

export function ErrorMessage({
  message = "Something went wrong.",
}: ErrorMessageProps) {
  return <p className="text-sm text-red-600">{message}</p>;
}
