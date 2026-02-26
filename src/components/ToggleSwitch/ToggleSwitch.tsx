import React, { KeyboardEvent } from "react";
import "./ToggleSwitchStyles.scss";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg"; // maps to CSS sizes
  id?: string;
  noLabel?: boolean;
  onOffState?: boolean;
  className?: string;
}

export default function ToggleSwitch({
  checked,
  onChange,
  ariaLabel,
  disabled = false,
  size = "md",
  id,
  noLabel,
  onOffState = false,
  className,
}: ToggleSwitchProps) {
  const handleToggle = () => {
    if (disabled) return;
    onChange(!checked);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      onChange(false);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      onChange(true);
    }
  };

  const offClassName = onOffState ? "is-off--grey" : "is-off";

  return (
    <div className={`toggle-container ${className}`}>
      {!noLabel && <span className={checked ? "toggle-label" : "toggle-label toggle-label--selected"}>Voice only</span>}
      <button
        id={id}
        type='button'
        role='switch'
        aria-checked={checked}
        aria-label={ariaLabel}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`toggle-switch toggle-switch--${size} ${checked ? "is-on" : offClassName} ${
          disabled ? "is-disabled" : ""
        }`}
        disabled={disabled}
      >
        <span className='toggle-track' aria-hidden='true'>
          <span className='toggle-knob' />
        </span>
      </button>
      {!noLabel && <span className={!checked ? "toggle-label" : "toggle-label toggle-label--selected"}>Immersive</span>}
    </div>
  );
}
