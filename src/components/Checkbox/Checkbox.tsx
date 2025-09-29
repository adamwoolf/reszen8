// CircleCheckbox.jsx
import React, { useEffect, useRef } from "react";
import "./CheckboxStyles.scss"; // paste the CSS from below into this file

/**
 * Props:
 * - checked (boolean)
 * - onChange (fn)
 * - color (string) CSS color for circle & check (default: "#10B981")
 * - size (number) diameter in px (default: 24)
 * - id, name, disabled, indeterminate
 */
export default function Checkbox({ checked = false, onChange, size = 24 }) {
  return (
    <label className='circle-checkbox'>
      <input checked={checked} onChange={onChange} type='checkbox' />
      <span style={{ height: size, width: size }} className='checkmark'></span>
    </label>
  );
}
