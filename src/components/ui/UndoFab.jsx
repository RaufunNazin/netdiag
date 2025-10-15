import React from "react";
import { FaUndo } from "react-icons/fa";

const UndoFab = ({ onClick, disabled }) => {
  return (
    <div className="absolute bottom-40 right-4 z-10">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center justify-center w-10 h-10 p-2 bg-[#ef4444] rounded-full text-white shadow-lg transition-all duration-300 ease-in-out hover:bg-[#d43c3c] focus:outline-none ${
          disabled
            ? "cursor-not-allowed bg-gray-400 hover:bg-gray-400"
            : "cursor-pointer"
        }`}
        title="Undo Last Action"
      >
        <FaUndo size={16} />
      </button>
    </div>
  );
};

export default UndoFab;
