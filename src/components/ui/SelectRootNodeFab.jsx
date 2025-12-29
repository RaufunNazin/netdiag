import { UI_ICONS } from "../../utils/icons";

const SelectRootNodeFab = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      // Updated: Added dark:bg-blue-600 and dark:hover:bg-blue-700
      className="root-fab-btn z-10 rounded-full bg-blue-500 p-3 text-white transition-all duration-200 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 flex items-center justify-center"
      title="Select Root Node"
    >
      <div className="w-4 h-4 flex items-center justify-center icon-root">
        {UI_ICONS.root_main}
      </div>
    </button>
  );
};

export default SelectRootNodeFab;
