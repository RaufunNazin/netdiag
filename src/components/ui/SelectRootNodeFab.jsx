// AFTER (The component is just a button)
import React from "react";

const SelectRootNodeFab = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="z-10 rounded-full bg-blue-500 p-3 text-white shadow-lg transition-all duration-200 hover:bg-blue-600"
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
        <rect x="3" y="3" width="7" height="7" rx="1"></rect>
        <rect x="14" y="3" width="7" height="7" rx="1"></rect>
        <rect x="14" y="14" width="7" height="7" rx="1"></rect>
        <path d="M6.5 10v4M17.5 10v4M6.5 17.5H14"></path>
      </svg>
    </button>
  );
};

export default SelectRootNodeFab;
