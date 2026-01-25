import React from "react";
import { UI_ICONS } from "../../utils/icons";

const ToggleMiniMapFab = ({ onClick, isVisible, disabled, className = "" }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`download-fab-btn p-2.5 rounded-full text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
        isVisible
          ? "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          : "bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-800 dark:hover:bg-neutral-700"
      } ${className}`}
      title="Toggle MiniMap [M]"
    >
      <div className="w-5 h-5 flex items-center justify-center icon-download">
        {React.cloneElement(UI_ICONS.map, {
          className: `w-5 h-5 ${
            isVisible ? "text-white" : "text-neutral-800 dark:text-neutral-300"
          }`,
        })}
      </div>
    </button>
  );
};

export default ToggleMiniMapFab;
