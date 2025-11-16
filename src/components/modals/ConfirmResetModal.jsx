const ConfirmResetModal = ({ isOpen, onClose, onConfirm, itemInfo }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 space-y-4">
        <h3 className="text-xl font-bold text-[#ef4444]">
          Confirm Position Reset
        </h3>
        <p>
          Are you sure you want to reset the position for{" "}
          <span className="font-semibold px-2 py-1 bg-slate-100 rounded-sm">
            {itemInfo}
          </span>
          ? The layout will be recalculated automatically.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 rounded-md hover:bg-slate-300 transition-all duration-200"
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
