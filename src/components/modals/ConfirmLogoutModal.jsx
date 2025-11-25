const ConfirmLogoutModal = ({ isOpen, onClose, onConfirm, userName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 space-y-4">
        <h3 className="text-xl font-bold text-[#ef4444]">Confirm Logout</h3>
        <div className="text-slate-600">
          Are you sure you want to log out from{" "}
          <span className="font-medium text-slate-800">
            {userName || "this account"}
          </span>
          ?
        </div>
        <div className="flex justify-end space-x-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#ef4444] text-white rounded-md hover:bg-[#d43c3c] transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLogoutModal;
