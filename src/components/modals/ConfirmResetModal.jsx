const ConfirmResetModal = ({ isOpen, onClose, onConfirm, itemInfo }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex justify-center items-center backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-xl w-96 space-y-4 transition-colors">
        <h3 className="text-xl font-bold text-[#ef4444]">
          Confirm Position Reset
        </h3>
        <p className="text-neutral-600 dark:text-neutral-300">
          Are you sure you want to reset the position for{" "}
          <span className="font-semibold px-2 py-1 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-200 rounded-sm">
            {itemInfo}
          </span>
          ? The layout will be recalculated automatically.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#ef4444] text-white rounded-md hover:bg-[#d43c3c] transition-all duration-200"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmResetModal;
