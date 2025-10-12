import React from "react";

const ConfirmResetModal = ({ isOpen, onClose, onConfirm, itemInfo }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 space-y-4">
        <h3 className="text-xl font-bold text-blue-600">
          Confirm Position Reset
        </h3>
        <p>
          Are you sure you want to reset the position for{" "}
          <span className="font-semibold px-2 py-1 bg-gray-100 rounded-sm">
            {itemInfo}
          </span>
          ? The layout will be recalculated automatically.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmResetModal;
