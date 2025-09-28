import React, { useState, useEffect } from "react";

const EditNodeModal = ({ node, isOpen, onClose, onSave }) => {
  const [label, setLabel] = useState(node?.data?.label || "");
  useEffect(() => {
    setLabel(node?.data?.label || "");
  }, [node]);
  if (!isOpen || !node) return null;

  const handleSave = () => {
    onSave(node.id, label);
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Edit Device</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Device Name
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditNodeModal;
