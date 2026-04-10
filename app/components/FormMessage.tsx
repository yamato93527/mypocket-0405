type FormMessageProps = {
  message?: string;
  error?: string;
  variant?: "error" | "success";
};

function FormMessage({ message, error, variant = "error" }: FormMessageProps) {
  const isError = variant === "error";
  const text = message ?? error;

  if (!text) {
    return null;
  }

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={
        isError
          ? "absolute top-full left-0 right-0 mt-2 bg-red-50 border border-red-200 rounded-md p-3 shadow-lg z-10"
          : "absolute top-full left-0 right-0 mt-2 bg-green-50 border border-green-200 rounded-md p-3 shadow-lg z-10"
      }
    >
      <p
        className={
          isError ? "text-red-700 text-sm" : "text-green-800 text-sm"
        }
      >
        {text}
      </p>
    </div>
  );
}

export default FormMessage;
