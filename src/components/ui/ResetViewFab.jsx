import { FaExpand } from "react-icons/fa";

const ResetViewFab = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="z-10 rounded-full bg-blue-500 p-3 text-white transition-all duration-200 hover:bg-blue-600"
      title="Reset View"
    >
      <FaExpand />
    </button>
  );
};

export default ResetViewFab;
