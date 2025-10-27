import { UI_ICONS } from "../../utils/icons";

const SelectRootNodeFab = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="z-10 rounded-full bg-blue-500 p-3 text-white transition-all duration-200 hover:bg-blue-600"
      title="Select Root Node"
    >
      {UI_ICONS.root_main}
    </button>
  );
};

export default SelectRootNodeFab;
