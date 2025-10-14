import React, { useState, useEffect, useRef } from "react";
import {
  LINK_TYPES,
  NODE_TYPES,
  DEVICE_TYPES,
  CORE_COLORS_DATA,
  SPLIT_RATIOS,
} from "../../utils/constants";
import SegmentedInput from "../ui/SegmentedInput";

// --- Custom Color Picker Component (copied from AddNodeModal) ---
const ColorPicker = ({ selectedColor, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  const handleColorSelect = (color) => {
    onChange(color);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={pickerRef}>
      <label className="label-style">Cable Color</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input-style flex items-center justify-between text-left"
      >
        <span className="flex items-center">
          <span
            className="w-5 h-5 rounded-full mr-3"
            style={{
              backgroundColor:
                CORE_COLORS_DATA.find((color) => color.hex === selectedColor)
                  ?.hex || "#FFFFFF",
            }}
          />
          {CORE_COLORS_DATA.find((color) => color.hex === selectedColor)
            ?.name || <span className="text-gray-500">Select Cable Color</span>}
        </span>
        <span className="text-slate-500">▼</span>
      </button>
      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-white border border-slate-300 rounded-md shadow-lg z-20 p-2 grid grid-cols-4 gap-2">
          {CORE_COLORS_DATA.map((color) => (
            <button
              key={color.hex}
              type="button"
              onClick={() => handleColorSelect(color.hex)}
              aria-label={color.name}
              className={`p-2 rounded-md text-sm text-center font-semibold hover:opacity-80 transition-opacity ${color.text}`}
              style={{ backgroundColor: color.hex }}
            >
              {color.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main Edit Modal Component ---
const EditNodeModal = ({ node, isOpen, onClose, onSave }) => {
  // State to hold current form data
  const [formData, setFormData] = useState({});
  // --- FIX: State to hold the original, unmodified data for comparison ---
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    if (node?.data) {
      // Create a clean object from the node data
      const initialData = {
        name: node.data.label || node.data.name || "",
        node_type: node.data.node_type || "",
        link_type: node.data.link_type || "Fiber Optic",
        brand: node.data.brand || "",
        model: node.data.model || "",
        serial_no: node.data.serial_no || "",
        mac: node.data.mac || "",
        ip: node.data.ip || "",
        split_ratio: node.data.split_ratio || "",
        split_group: node.data.split_group || "",
        cable_id: node.data.cable_id || "",
        cable_start: node.data.cable_start || "",
        cable_end: node.data.cable_end || "",
        cable_length: node.data.cable_length || "",
        cable_color: node.data.cable_color || "",
        cable_desc: node.data.cable_desc || "",
        vlan: node.data.vlan || "",
        remarks: node.data.remarks || "",
        // Combine lat/lon into a single location string for the UI
        location:
          node.data.lat1 && node.data.long1
            ? `${node.data.lat1}, ${node.data.long1}`
            : "",
      };

      setFormData(initialData);
      setOriginalData({ ...initialData }); // Save the original state for comparison on save
    }
  }, [node]);

  if (!isOpen || !node) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    let changes = {};

    // Compare each field to find what has changed
    for (const key in formData) {
      if (formData[key] !== originalData[key]) {
        changes[key] = formData[key];
      }
    }

    // If the location string was changed, parse it into lat1 and long1
    if ("location" in changes) {
      const coords = (changes.location || "").split(/[, ]+/).filter(Boolean);
      let lat = null;
      let lon = null;
      if (coords.length === 2) {
        const parsedLat = parseFloat(coords[0]);
        const parsedLon = parseFloat(coords[1]);
        if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
          lat = parsedLat;
          lon = parsedLon;
        }
      }
      changes.lat1 = lat;
      changes.long1 = lon;
      delete changes.location; // Remove the temporary field before sending
    }

    // Convert any changed numeric fields
    const numericFields = [
      "split_ratio",
      "cable_start",
      "cable_end",
      "cable_length",
    ];
    numericFields.forEach((field) => {
      if (field in changes && typeof changes[field] === "string") {
        changes[field] = parseInt(changes[field], 10) || null;
      }
    });

    // Only save if there are actual changes
    if (Object.keys(changes).length > 0) {
      onSave(node.id, changes);
    }

    onClose();
  };

  return (
    <div className="absolute inset-0 bg-slate-900/70 z-[100] flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">
        <h3 className="text-2xl font-bold text-slate-800 pb-4 mb-4">
          Edit Device Details
        </h3>
        <div className="overflow-y-auto pr-6 -mr-6 flex-grow">
          {/* Form layout is copied directly from AddNodeModal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <h4 className="md:col-span-2 text-lg font-bold text-slate-700 mt-2">
              Basic Info
            </h4>
            <div className="md:col-span-2">
              <label className="label-style">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-style"
                placeholder="Enter device name"
              />
            </div>
            <div>
              <label className="label-style">Link Type</label>
              <select
                name="link_type"
                value={formData.link_type}
                onChange={handleChange}
                className="input-style"
              >
                {LINK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-style">
                Device <span className="text-red-500">*</span>
              </label>
              <select
                name="node_type"
                value={formData.node_type}
                onChange={handleChange}
                className="input-style"
              >
                {NODE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {formData.node_type && (
              <>
                <h4 className="md:col-span-2 text-lg font-bold text-slate-700 mt-6">
                  Device Detail
                </h4>
                <div>
                  <label className="label-style">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="input-style"
                    placeholder="Enter brand name"
                  />
                </div>
                <div>
                  <label className="label-style">Model</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="input-style"
                    placeholder="Enter model name"
                  />
                </div>
                <div>
                  <label className="label-style">Serial No</label>
                  <input
                    type="text"
                    name="serial_no"
                    value={formData.serial_no}
                    onChange={handleChange}
                    className="input-style"
                    placeholder="Enter serial number"
                  />
                </div>
                {formData.node_type === "ONU" && (
                  <>
                    <div>
                      <label className="label-style">Device Type</label>
                      <select
                        name="device_type"
                        value={formData.device_type}
                        onChange={handleChange}
                        className="input-style"
                      >
                        {DEVICE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label-style">MAC</label>
                      <SegmentedInput
                        count={6}
                        maxLength={2}
                        separator=":"
                        value={formData.mac}
                        onChange={(macValue) =>
                          handleChange({
                            target: { name: "mac", value: macValue },
                          })
                        }
                        inputMode="text"
                      />
                    </div>
                    <div>
                      <label className="label-style">IP</label>
                      <SegmentedInput
                        count={4}
                        maxLength={3}
                        separator="."
                        value={formData.ip}
                        onChange={(ipValue) =>
                          handleChange({
                            target: { name: "ip", value: ipValue },
                          })
                        }
                        inputMode="numeric"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {formData.node_type === "Splitter" && (
              <>
                <h4 className="md:col-span-2 text-lg font-bold text-slate-700 mt-6">
                  Splitter Detail
                </h4>
                <div>
                  <label className="label-style">
                    Split Ratio <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="split_ratio"
                    value={formData.split_ratio}
                    onChange={handleChange}
                    className="input-style"
                    placeholder="Select split ratio"
                  >
                    {SPLIT_RATIOS.map((ratio) => (
                      <option key={ratio} value={ratio}>
                        {ratio}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-style">Split Group</label>
                  <input
                    type="text"
                    name="split_group"
                    value={formData.split_group}
                    onChange={handleChange}
                    className="input-style"
                    placeholder="Enter split group"
                  />
                </div>
              </>
            )}
            {formData.node_type && (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <h4 className="md:col-span-2 text-lg font-bold text-slate-700 mt-6">
                  Cable Detail
                </h4>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                  <div>
                    <label className="label-style">Cable ID</label>
                    <input
                      type="text"
                      name="cable_id"
                      value={formData.cable_id}
                      onChange={handleChange}
                      className="input-style"
                      placeholder="Enter cable ID"
                    />
                  </div>
                  <div>
                    <label className="label-style">Length (m)</label>
                    <input
                      type="number"
                      name="cable_length"
                      value={formData.cable_length}
                      onChange={handleChange}
                      className="input-style"
                      placeholder="Enter cable length (meters)"
                    />
                  </div>
                  <ColorPicker
                    selectedColor={formData.cable_color}
                    onChange={(color) =>
                      handleChange({
                        target: { name: "cable_color", value: color },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="label-style">Start Unit</label>
                  <input
                    type="number"
                    name="cable_start"
                    value={formData.cable_start}
                    onChange={handleChange}
                    className="input-style"
                    placeholder="Enter start unit"
                  />
                </div>
                <div>
                  <label className="label-style">End Unit</label>
                  <input
                    type="number"
                    name="cable_end"
                    value={formData.cable_end}
                    onChange={handleChange}
                    className="input-style"
                    placeholder="Enter end unit"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label-style">Description</label>
                  <input
                    type="text"
                    name="cable_desc"
                    value={formData.cable_desc}
                    onChange={handleChange}
                    className="input-style"
                    placeholder="Enter cable description"
                  />
                </div>
              </div>
            )}

            {formData.node_type && (
              <>
                <h4 className="md:col-span-2 text-lg font-bold text-slate-700 mt-6">
                  Other Info
                </h4>
                <div
                  className={`md:col-span-2 grid grid-cols-1 ${
                    formData.node_type === "ONU"
                      ? "md:grid-cols-3"
                      : "md:grid-cols-2"
                  } gap-x-8 gap-y-6`}
                >
                  {formData.node_type === "ONU" && (
                    <div>
                      <label className="label-style">VLAN</label>
                      <input
                        type="text"
                        name="vlan"
                        value={formData.vlan}
                        onChange={handleChange}
                        className="input-style"
                        placeholder="Enter VLAN"
                      />
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="label-style">Location (Lat, Long)</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location || ""}
                      onChange={handleChange}
                      className="input-style"
                      placeholder="Enter latitude, longitude"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="label-style">Remarks</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    className="input-style"
                    rows="3"
                    placeholder="Enter any remarks"
                  ></textarea>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 border-t border-slate-200 pt-6 mt-8">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditNodeModal;
