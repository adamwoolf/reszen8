import React, { useRef, useEffect } from "react";
import "./TabsGroupStyles.scss";

const TabsGroup = ({
  items,
  onClick,
  activeItem,
}: {
  items: any[];
  onClick: (value: any) => void;
  activeItem: any;
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLButtonElement[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update slider position whenever activeItem changes
  // useEffect(() => {
  //   const offset = window.innerWidth < 400 ? 20 : 33;

  //   const containerLeft = containerRef.current?.getBoundingClientRect()?.left - offset;

  //   const index = items.indexOf(activeItem);
  //   const activeTab = tabsRef.current[index];
  //   console.log(activeTab.style);
  //   if (activeTab && sliderRef.current) {
  //     sliderRef.current.style.width = `${activeTab.offsetWidth - 10}px`;
  //     sliderRef.current.style.transform = `translateX(${activeTab.offsetLeft - containerLeft}px)`;
  //   }
  // }, [activeItem, items]);

  return (
    <div className='tabs-group'>
      <div ref={containerRef} className='tabs-group__tabs'>
        {items.map((r, i) => (
          <button
            ref={(el) => {
              if (el) tabsRef.current[i] = el; // store button in ref array
            }}
            key={r}
            className={`tabs-group__tab ${r === activeItem ? "tabs-group__tab--active" : ""}`}
            onClick={() => onClick(r)}
          >
            {r === "thisWeek"
              ? "This Week"
              : r === "lastWeek"
                ? "Last Week"
                : r === "today"
                  ? "Today"
                  : r === "yesterday"
                    ? "Yesterday"
                    : "Total Journey"}
          </button>
        ))}
      </div>
      {/* <div ref={sliderRef} className='tabs-group__active-marker' /> */}
    </div>
  );
};

export default TabsGroup;
