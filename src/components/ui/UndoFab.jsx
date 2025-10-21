import { IoArrowUndoOutline } from "react-icons/io5";

const UndoFab = ({ onClick, disabled }) => {
  return (
    <div className="z-10">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`p-2 bg-[#ef4444] rounded-full text-white transition-all duration-300 ease-in-out hover:bg-[#d43c3c] focus:outline-none ${
          disabled
            ? "cursor-not-allowed bg-gray-400 hover:bg-gray-400"
            : "cursor-pointer"
        }`}
        title="Undo Last Action"
      >
        <IoArrowUndoOutline size={24} />
      </button>
    </div>
  );
};

export default UndoFab;
