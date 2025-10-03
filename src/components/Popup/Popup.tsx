import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import "./PopupStyles.scss";

const Popup = ({
  show,
  onClose,
  children,
  fitContent,
  showClose = true,
}: {
  fitContent?: boolean;
  show: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  showClose?: boolean;
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState(false);

  const handleAnimationEnd = () => {
    if (leaving) {
      onClose?.();
      setLeaving(false);
    }
  };

  const fadeOut = () => setLeaving(true);
  useEffect(() => {
    if (show) {
      // Lock scroll
      document.body.classList.add("locked-by-popup");

      // Focus trap setup
      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      firstElement.focus();
      // Optional autofocus element
      const autoFocusEl = modal.querySelector<HTMLElement>("[data-autofocus]");

      // Delay focus to ensure DOM is fully updated
      requestAnimationFrame(() => {
        // (autoFocusEl || firstElement)?.focus();
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
          fadeOut();
        }
      };

      document.addEventListener("keydown", handleTab);

      return () => {
        document.removeEventListener("keydown", handleTab);
        document.body.classList.remove("locked-by-popup");
      };
    } else {
      document.body.classList.remove("locked-by-popup");
    }
  }, [show, onClose]);

  if (!show) return null;

  const rootElement = document.getElementById("modal-root");
  if (!rootElement) return null;

  return ReactDOM.createPortal(
    <>
      <div
        style={fitContent ? { height: "auto", paddingBottom: showClose ? 70 : 30 } : {}}
        onAnimationEnd={handleAnimationEnd}
        className={!leaving ? "popup" : "popup popup--leaving"}
        ref={modalRef}
      >
        <div className='popup__content-container'>{children}</div>
        {showClose && (
          <button className='popup__close' onClick={fadeOut}>
            close
          </button>
        )}
      </div>

      <div className='popup__backdrop' />
    </>,
    rootElement
  );
};

export default Popup;
