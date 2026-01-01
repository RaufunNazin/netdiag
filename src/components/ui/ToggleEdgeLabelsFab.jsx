import React from "react";
import { UI_ICONS } from "../../utils/icons";

const ToggleEdgeLabelsFab = ({
  onClick,
  disabled,
  isLabelsVisible,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`toggle-fab-btn p-3 rounded-full text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
        isLabelsVisible
          ? "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          : "bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-800 dark:hover:bg-neutral-700"
      } ${className}`}
      title={
        isLabelsVisible ? "Hide Cable Labels [L]" : "Show Cable Labels [L]"
      }
    >
      <div className="w-4 h-4 flex items-center justify-center icon-tag">
        {React.cloneElement(UI_ICONS.tag_main, {
          className: `w-4 h-4 ${
            isLabelsVisible
              ? "text-white"
              : "text-neutral-800 dark:text-neutral-300"
          }`,
        })}
      </div>
    </button>
  );
};

export default ToggleEdgeLabelsFab;
