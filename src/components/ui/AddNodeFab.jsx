import { UI_ICONS } from "../../utils/icons";

const AddNodeFab = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="z-10  p-3 rounded-full text-white transition-all duration-200 hover:bg-green-600 bg-green-500"
      title="Add New Device"
    >
      {UI_ICONS.add_main}
    </button>
  );
};

export default AddNodeFab;
