// AFTER (The component is just a button)
import React from "react";

const SelectRootNodeFab = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="z-10 rounded-full bg-blue-500 p-3 text-white transition-all duration-200 hover:bg-blue-600"
      title="Select Root Node"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Top (Root) Node */}
        <rect x="8.5" y="3" width="7" height="7" rx="1"></rect>
        {/* Bottom-Left Child Node */}
        <rect x="3" y="14" width="7" height="7" rx="1"></rect>
        {/* Bottom-Right Child Node */}
        <rect x="14" y="14" width="7" height="7" rx="1"></rect>

        {/* Connections: From Root to children */}
        <path d="M12 10 V 13 H 6.5 V 14 M12 13 H 17.5 V 14"></path>
      </svg>
    </button>
  );
};

export default SelectRootNodeFab;
