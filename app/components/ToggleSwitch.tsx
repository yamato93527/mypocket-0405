type ToggleSwitchProps = {
  checked: boolean;
  onChange: (nextValue: boolean) => void;
  label?: string;
  className?: string;
};

function ToggleSwitch({
  checked,
  onChange,
  label = "URL登録",
  className = "",
}: ToggleSwitchProps) {
  return (
    <div className={`flex items-center gap-2 whitespace-nowrap ${className}`}>
      <span className="text-sm text-gray-600">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default ToggleSwitch;
