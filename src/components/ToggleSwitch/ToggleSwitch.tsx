import React, { KeyboardEvent } from "react";
import "./ToggleSwitchStyles.scss";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg"; // maps to CSS sizes
  id?: string;
}

export default function ToggleSwitch({
  checked,
  onChange,
  ariaLabel,
  disabled = false,
  size = "md",
  id,
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

  return (
    <div className='toggle-container'>
      <span className={checked ? "toggle-label" : "toggle-label toggle-label--selected"}>Voice Only</span>
      <button
        id={id}
        type='button'
        role='switch'
        aria-checked={checked}
        aria-label={ariaLabel}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`toggle-switch toggle-switch--${size} ${checked ? "is-on" : "is-off"} ${
          disabled ? "is-disabled" : ""
        }`}
        disabled={disabled}
      >
        <span className='toggle-track' aria-hidden='true'>
          <span className='toggle-knob' />
        </span>
      </button>
      <span className={!checked ? "toggle-label" : "toggle-label toggle-label--selected"}>Immersive Meditations</span>
    </div>
  );
}
