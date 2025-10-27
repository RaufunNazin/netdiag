import { UI_ICONS } from "../../utils/icons";

const ResetViewFab = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="z-10 rounded-full bg-blue-500 p-3 text-white transition-all duration-200 hover:bg-blue-600"
      title="Reset View"
    >
      {UI_ICONS.expand_main}
    </button>
  );
};

export default ResetViewFab;
