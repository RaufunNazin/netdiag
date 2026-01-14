import { useEffect } from "react";

const ConfirmLogoutModal = ({ isOpen, onClose, onConfirm, userName }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen && e.key === "Enter") {
        e.preventDefault();
        onConfirm();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onConfirm]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-xl w-96 space-y-4 transition-colors">
        <h3 className="text-xl font-bold text-[#ef4444]">Confirm Logout</h3>
        <div className="text-neutral-600 dark:text-neutral-300">
          Are you sure you want to log out from{" "}
          <span className="font-medium text-neutral-800 dark:text-neutral-50">
            {userName || "this account"}
          </span>
          ?
        </div>
        <div className="flex justify-end space-x-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
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
