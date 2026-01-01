import { UI_ICONS } from "../../utils/icons";

const ResetViewFab = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="reset-fab-btn z-10 rounded-full bg-blue-500 p-3 text-white transition-all duration-200 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 flex items-center justify-center"
      title="Reset View [0]"
    >
      <div className="w-4 h-4 flex items-center justify-center icon-expand">
        {UI_ICONS.expand_main}
      </div>
    </button>
  );
};

export default ResetViewFab;
