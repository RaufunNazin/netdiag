import React from "react";
import { FaExpand } from "react-icons/fa";

/**
 * A Floating Action Button that triggers a reset of the React Flow viewport.
 * @param {object} props - The component props.
 * @param {Function} props.onClick - The function to call when the button is clicked.
 */
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
