const ConfirmSaveModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex justify-center items-center backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-xl w-96 space-y-4 transition-colors">
        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">
          Confirm Save
        </h3>
        <p className="text-neutral-600 dark:text-neutral-300">
          Are you sure you want to save these changes? This action will clear
          the undo history and cannot be undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSaveModal;
