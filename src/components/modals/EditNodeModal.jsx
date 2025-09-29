import React, { useState, useEffect } from "react";

const EditNodeModal = ({ node, isOpen, onClose, onSave }) => {
  // Use a single state object for the entire form
  const [formData, setFormData] = useState({});

  // When the modal opens, populate the form with all the node's data
  useEffect(() => {
    if (node?.data) {
      setFormData({
        // Use default empty strings for any potentially null values
        name: node.data.name || "",
        mac: node.data.mac || "",
        serial_no: node.data.serial_no || "",
        brand: node.data.brand || "",
        model: node.data.model || "",
        node_type: node.data.node_type || "",
        vlan: node.data.vlan || null,
        cable_color: node.data.cable_color || "",
        cable_desc: node.data.cable_desc || "",
        lat1: node.data.lat1 || "",
        long1: node.data.long1 || "",
        remarks: node.data.remarks || "",
      });
    }
  }, [node]);

  if (!isOpen || !node) return null;

  // This generic handler updates the form state for any input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // This function passes the entire formData object back
  const handleSave = () => {
    onSave(node.id, formData);
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black/50 z-[100] flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[500px] max-h-[90vh] overflow-y-auto space-y-4">
        <h3 className="text-xl font-bold text-gray-800 border-b pb-2">
          Edit Device Details
        </h3>

        {/* --- Primary Info --- */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Device Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MAC Address
            </label>
            <input
              type="text"
              name="mac"
              value={formData.mac}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Serial Number
          </label>
          <input
            type="text"
            name="serial_no"
            value={formData.serial_no}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* --- Device Details --- */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* --- Network & Cable Info --- */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              VLAN
            </label>
            <input
              type="number"
              name="vlan"
              value={formData.vlan}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cable Color
            </label>
            <input
              type="text"
              name="cable_color"
              value={formData.cable_color}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cable Description
          </label>
          <input
            type="text"
            name="cable_desc"
            value={formData.cable_desc}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* --- Location Info --- */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              type="text"
              name="lat1"
              value={formData.lat1}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="text"
              name="long1"
              value={formData.long1}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* --- Remarks --- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remarks
          </label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows="3"
          ></textarea>
        </div>

        {/* --- Action Buttons --- */}
        <div className="flex justify-end space-x-2 border-t pt-4 mt-4">
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
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditNodeModal;
