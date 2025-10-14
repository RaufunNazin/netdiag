import React from "react";

const AddNodeFab = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-28 right-4 z-10  p-3 rounded-full shadow-lg text-white transition-all duration-200 hover:bg-green-600 bg-green-500"
      title="Add New Device"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5v14"></path>
        <path d="M5 12h14"></path>
      </svg>
    </button>
  );
};

export default AddNodeFab;
