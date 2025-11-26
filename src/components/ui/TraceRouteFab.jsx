import { UI_ICONS } from "../../utils/icons";

const TraceRouteFab = ({ onClick, disabled, className = "" }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-3 rounded-full text-white bg-blue-500 hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title="Trace Network Path"
    >
      {UI_ICONS.route_main}
    </button>
  );
};

export default TraceRouteFab;
