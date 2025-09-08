import React, { useState } from "react";
import Icon, { getIcon } from "../Icon/Icon";

const Filters = ({ searchText, filterPubs, activeFilter, search }) => {
  return (
    <div className='publications__filters'>
      <input
        className='publications__search'
        value={search}
        onChange={searchText}
        placeholder='Type to search articles'
      />
      <div className='publications__tiles'>
        {Object.keys(getIcon).map((icon) => (
          <button
            key={icon}
            className={activeFilter !== icon ? "publications__filter non-active-filter" : "publications__filter"}
            onClick={() => filterPubs(icon)}
          >
            <Icon large type={icon} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Filters;
