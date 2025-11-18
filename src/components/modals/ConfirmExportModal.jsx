const ConfirmExportModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 space-y-4">
        <h3 className="text-xl font-bold text-blue-600">
          Confirm Diagram Export
        </h3>
        <p>
          Exporting a full, high-resolution image of the diagram can take 30-40
          seconds or more.
        </p>
        <p className="font-medium">Are you sure you want to start?</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 rounded-md hover:bg-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmExportModal;
