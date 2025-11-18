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
          : "bg-slate-500 hover:bg-slate-600"
      } ${className}`}
      title={isLabelsVisible ? "Hide Cable Labels" : "Show Cable Labels"}
    >
      {UI_ICONS.tag || "Labels"}
    </button>
  );
};

export default ToggleEdgeLabelsFab;
