import { UI_ICONS } from "../../utils/icons";

const UndoFab = ({ onClick, disabled }) => {
  return (
    <div className="z-10">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`undo-fab-btn p-2.5 rounded-full text-white transition-all duration-200 ease-in-out focus:outline-none flex items-center justify-center ${
          disabled
            ? "cursor-not-allowed bg-neutral-400 hover:bg-neutral-400 dark:bg-neutral-700 dark:hover:bg-neutral-700"
            : "cursor-pointer bg-[#ef4444] hover:bg-[#d43c3c] dark:bg-red-600 dark:hover:bg-red-700"
        }`}
        title="Undo Last Action [CTRL+Z]"
      >
        <div className="w-5 h-5 flex items-center justify-center icon-undo">
          {UI_ICONS.undo_main}
        </div>
      </button>
    </div>
  );
};

export default UndoFab;
