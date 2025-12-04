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
      // Added 'toggle-fab-btn' class
      className={`toggle-fab-btn p-3 rounded-full text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
        isLabelsVisible
          ? "bg-blue-500 hover:bg-blue-600"
          : "bg-slate-300 hover:bg-slate-400"
      } ${className}`}
      title={isLabelsVisible ? "Hide Cable Labels" : "Show Cable Labels"}
    >
       {/* Fixed size wrapper + icon class */}
      <div className="w-4 h-4 flex items-center justify-center icon-tag">
        {React.cloneElement(UI_ICONS.tag_main, {
          // Color logic is now handled by the parent button's state
          className: `w-4 h-4 ${
            isLabelsVisible ? "text-white" : "text-slate-800"
          }`,
        })}
      </div>
    </button>
  );
};

export default ToggleEdgeLabelsFab;