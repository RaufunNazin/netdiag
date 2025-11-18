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
      className={`p-3 rounded-full text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
        isLabelsVisible
          ? "bg-blue-500 hover:bg-blue-600"
          : "bg-slate-300 hover:bg-slate-400"
      } ${className}`}
      title={isLabelsVisible ? "Hide Cable Labels" : "Show Cable Labels"}
    >
      {React.cloneElement(UI_ICONS.tag, {
        className: `w-4 h-4 ${
          isLabelsVisible ? "text-white" : "text-slate-800"
        }`,
      })}
    </button>
  );
};

export default ToggleEdgeLabelsFab;
