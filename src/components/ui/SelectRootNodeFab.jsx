import { UI_ICONS } from "../../utils/icons";

const SelectRootNodeFab = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      // Added 'root-fab-btn' class
      className="root-fab-btn z-10 rounded-full bg-blue-500 p-3 text-white transition-all duration-200 hover:bg-blue-600 flex items-center justify-center"
      title="Select Root Node"
    >
       {/* Fixed size wrapper + icon class */}
      <div className="w-4 h-4 flex items-center justify-center icon-root">
        {UI_ICONS.root_main}
      </div>
    </button>
  );
};

export default SelectRootNodeFab;