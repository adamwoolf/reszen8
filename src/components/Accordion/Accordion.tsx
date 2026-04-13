import React, { useState, useEffect, useRef } from "react";
import "./AccordionStyles.scss";
import { FaPlus, FaMinus } from "react-icons/fa";

const Accordion = ({ header, children, mainSection, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen ? true : false);
  const [contentHeight, setContentHeight] = useState(0);
  const ref = useRef();

  useEffect(() => setContentHeight(open ? ref.current.scrollHeight : 0));

  return (
    <div>
      {mainSection ? (
        <>
          {" "}
          <button type='button' onClick={() => setOpen(!open)} className='accordion-header'>
            {header}

            <div className='accordion-header--toggle-button' onClick={() => setOpen(!open)}>
              {" "}
              {open ? <FaMinus color='orange' /> : <FaPlus color='orange' />}
            </div>
          </button>
          <hr />
        </>
      ) : (
        <button type='button' onClick={() => setOpen(!open)} className='accordion-header--dark'>
          {" "}
          {header}
          {open ? <FaMinus color='orange' /> : <FaPlus color='orange' />}
        </button>
      )}
      {children && (
        <div
          ref={ref}
          className={`accordion-content ${open ? "accordion-open" : ""}`}
          style={{ maxHeight: contentHeight }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;
