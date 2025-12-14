import { UI_ICONS } from "../../utils/icons";

const UndoFab = ({ onClick, disabled }) => {
  return (
    <div className="z-10">
      <button
        onClick={onClick}
        disabled={disabled}
        // Added 'undo-fab-btn' class
        className={`undo-fab-btn p-2.5 bg-[#ef4444] rounded-full text-white transition-all duration-300 ease-in-out hover:bg-[#d43c3c] focus:outline-none flex items-center justify-center ${
          disabled
            ? "cursor-not-allowed bg-slate-400 hover:bg-slate-400"
            : "cursor-pointer"
        }`}
        title="Undo Last Action [CTRL+Z]"
      >
        {/* Fixed size wrapper + icon class */}
        <div className="w-5 h-5 flex items-center justify-center icon-undo">
          {UI_ICONS.undo_main}
        </div>
      </button>
    </div>
  );
};

export default UndoFab;
