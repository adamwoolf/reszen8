import React, { useState } from "react";
import Icon, { getIcon } from "../Icon/Icon";
import { trackCTA } from "../../utils/analytics";

const Filters = ({ placeholder, searchText, filterPubs, activeFilter, search }) => {
  return (
    <div className='publications__filters'>
      <div className='publications__tiles'>
        {Object.keys(getIcon)
          .filter((key) => key !== "Uncategorized")
          .map((icon) => (
            <button
              key={icon}
              className={activeFilter !== icon ? "publications__filter non-active-filter" : "publications__filter"}
              onClick={() => {
                trackCTA(`Filter Icon - ${icon}`);
                filterPubs(icon);
              }}
            >
              <Icon large type={icon} />
            </button>
          ))}
      </div>
      <input
        className='publications__search'
        value={search}
        onChange={searchText}
        placeholder={placeholder || "Type to search articles"}
      />
    </div>
  );
};

export default Filters;
