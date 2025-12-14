import { UI_ICONS } from "../../utils/icons";

const AddNodeFab = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      // Added 'add-fab-btn' class
      className="add-fab-btn z-10 p-3 rounded-full text-white transition-all duration-200 hover:bg-green-600 bg-green-500 flex items-center justify-center"
      title="Add New Device [N]"
    >
       {/* Fixed size wrapper + icon class */}
      <div className="w-4 h-4 flex items-center justify-center icon-add">
        {UI_ICONS.add_main}
      </div>
    </button>
  );
};

export default AddNodeFab;