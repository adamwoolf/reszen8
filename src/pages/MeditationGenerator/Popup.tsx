import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "./PopupStyles.scss";

const Popup = ({ show, onClose, children }: { show: boolean; onClose: () => void; children: React.ReactNode }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) {
      // Lock scroll
      document.body.style.overflow = "hidden";

      // Focus trap setup
      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Optional autofocus element
      const autoFocusEl = modal.querySelector<HTMLElement>("[data-autofocus]");

      // Delay focus to ensure DOM is fully updated
      requestAnimationFrame(() => {
        (autoFocusEl || firstElement)?.focus();
      });

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === "Tab" && focusableElements.length > 0) {
          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }

        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleTab);

      return () => {
        document.removeEventListener("keydown", handleTab);
        document.body.style.overflow = "auto"; // Clean up scroll lock
      };
    } else {
      document.body.style.overflow = "auto";
    }
  }, [show, onClose]);

  if (!show) return null;

  const rootElement = document.getElementById("modal-root");
  if (!rootElement) return null;

  return ReactDOM.createPortal(
    <>
      <div className='popup' ref={modalRef}>
        <div className='popup__content-container'>{children}</div>
        <button className='popup__close' onClick={onClose}>
          close
        </button>
      </div>
      <div className='popup__backdrop' />
    </>,
    rootElement
  );
};

export default Popup;
