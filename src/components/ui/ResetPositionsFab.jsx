import React, { useState, useRef, useEffect } from "react";

const ResetPositionsFab = ({ onReset, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // SVG icon defined inside the component, just like the model
  const resetIcon = (
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
      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 12m0 8h5.582m.582-8a8.001 8.001 0 0015.356-2M4 12v5h.582m15.356-2A8.001 8.001 0 004 12m0 8h5.582m.582-8a8.001 8.001 0 0015.356-2" />
    </svg>
  );

  // Effect to close the dropdown if the user clicks outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // Handler to call the passed onReset function and close the menu
  const handleResetClick = (scope) => {
    onReset(scope);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="absolute bottom-5 left-5 z-10">
      {/* The small dropdown menu */}
      {isOpen && (
        <div className="absolute bottom-full mb-2 w-48 bg-white rounded-md shadow-lg py-1">
          <ul className="list-none p-0 m-0">
            <li
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
              onClick={() => handleResetClick("all")}
            >
              Reset All Positions
            </li>
            <li
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
              onClick={() => handleResetClick("manual")}
            >
              Reset Manual Positions
            </li>
          </ul>
        </div>
      )}

      {/* The main FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="p-3 rounded-full shadow-lg text-white bg-[#ef4444] hover:bg-[#d43c3c] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Reset Positions"
      >
        {resetIcon}
      </button>
    </div>
  );
};

export default ResetPositionsFab;
