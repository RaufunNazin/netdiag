import { UI_ICONS } from "../../utils/icons";

const TraceRouteFab = ({ onClick, disabled, className = "" }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`trace-fab-btn p-3 rounded-full text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${className}`}
      title="Trace Network Path [T]"
    >
      <div className="w-4 h-4 flex items-center justify-center icon-trace">
        {UI_ICONS.route_main}
      </div>
    </button>
  );
};

export default TraceRouteFab;