import React from "react";

const ToggleMiniMapFab = ({ onClick, isVisible, disabled, className = "" }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`download-fab-btn p-2 rounded-full text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
        isVisible
          ? "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          : "bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-800 dark:hover:bg-neutral-700"
      } ${className}`}
      title="Toggle MiniMap [M]"
    >
      <div className="w-6 h-6 flex items-center justify-center icon-download">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.15}
          stroke="currentColor"
          className={`w-6 h-6 ${
            isVisible ? "text-white" : "text-neutral-800 dark:text-neutral-300"
          }`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21s6-5.686 6-10a6 6 0 10-12 0c0 4.314 6 10 6 10z"
          />
          <circle cx="12" cy="11" r="2.5" />
        </svg>
      </div>
    </button>
  );
};

export default ToggleMiniMapFab;
