import React, { useState } from "react";

const AddNodeModal = ({
  isOpen,
  onClose,
  onSave,
  defaultPosition,
  isInsertion,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("default");

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim()) {
      onSave(name, type, defaultPosition);
      onClose();
      setName("");
      setType("default");
    } else {
      // Using a less obtrusive way to show error.
      const input = document.querySelector("#add-node-name-input");
      if (input) input.style.borderColor = "red";
    }
  };

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 space-y-4">
        <h3 className="text-xl font-bold text-gray-800">
          {isInsertion ? "Insert New Device" : "Add New Device"}
        </h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Device Name
          </label>
          <input
            id="add-node-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Switch-02"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Device Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="default">Default (Switch/TJ-Box)</option>
            <option value="input">Root (ISP Office)</option>
            <option value="output">Client (ONU)</option>
          </select>
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
            {isInsertion ? "Insert Device" : "Add Device"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNodeModal;
