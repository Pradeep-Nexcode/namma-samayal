interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  size?: "sm" | "md";
  disabled?: boolean;
  label?: string;
  ariaLabel?: string;
}

const SIZES = {
  sm: { track: "w-8 h-4", thumb: "w-3 h-3", translate: "translate-x-4" },
  md: { track: "w-10 h-5", thumb: "w-4 h-4", translate: "translate-x-5" },
};

const Toggle = ({ checked, onChange, size = "md", disabled, label, ariaLabel }: ToggleProps) => {
  const s = SIZES[size];
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) onChange(!checked);
  };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel || label || (checked ? "Active" : "Inactive")}
      disabled={disabled}
      onClick={handleClick}
      className={`inline-flex items-center gap-2 select-none ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`relative inline-flex items-center ${s.track} rounded-full transition-colors ${
          checked ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute left-0.5 ${s.thumb} bg-white rounded-full shadow transition-transform ${
            checked ? s.translate : "translate-x-0"
          }`}
        />
      </span>
      {label && (
        <span className={`text-xs font-medium ${checked ? "text-green-600" : "text-gray-500"}`}>
          {label}
        </span>
      )}
    </button>
  );
};

export default Toggle;
