import { UI_ICONS } from "../../utils/icons";

const UndoFab = ({ onClick, disabled }) => {
  return (
    <div className="z-10">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`p-2.5 bg-[#ef4444] rounded-full text-white transition-all duration-300 ease-in-out hover:bg-[#d43c3c] focus:outline-none ${
          disabled
            ? "cursor-not-allowed bg-slate-400 hover:bg-slate-400"
            : "cursor-pointer"
        }`}
        title="Undo Last Action"
      >
        {UI_ICONS.undo_main}
      </button>
    </div>
  );
};

export default UndoFab;
