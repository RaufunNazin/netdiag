import React, { useState, useEffect, useRef } from "react";

// --- Predefined options for dropdowns ---
const LINK_TYPES = ["Fiber Optic", "Ethernet", "Wireless"];
const DEVICE_TYPES = ["", "Splitter", "TJ", "ONU"];
const BRAND_OPTIONS = ["", "Nokia", "Huawei", "Cisco", "VSOL", "Other"];
const CORE_COLORS_DATA = [
  { name: "Blue", hex: "#3b82f6", text: "text-white" },
  { name: "Orange", hex: "#f97316", text: "text-white" },
  { name: "Green", hex: "#22c55e", text: "text-white" },
  { name: "Brown", hex: "#a16207", text: "text-white" },
  { name: "Slate", hex: "#64748b", text: "text-white" },
  { name: "White", hex: "#f8fafc", text: "text-slate-800" },
  { name: "Red", hex: "#ef4444", text: "text-white" },
  { name: "Black", hex: "#1e293b", text: "text-white" },
  { name: "Yellow", hex: "#facc15", text: "text-slate-800" },
  { name: "Violet", hex: "#8b5cf6", text: "text-white" },
  { name: "Rose", hex: "#f43f5e", text: "text-white" },
  { name: "Aqua", hex: "#22d3ee", text: "text-slate-800" },
];
const SPLIT_RATIOS = ["", "2", "4", "8", "16", "32", "64"];

// --- LocalStorage Key ---
const STORAGE_KEY = "addNodeFormData";

// --- Initial state for the form ---
const initialState = {
  link_type: "Fiber Optic",
  node_type: "",
  name: "",
  brand: "",
  brand_other: "",
  model: "",
  serial_no: "",
  mac: "",
  ip: "",
  split_ratio: "",
  split_group: "",
  cable_id: "",
  cable_start: "",
  cable_end: "",
  cable_length: "",
  cable_color: "",
  cable_desc: "",
  vlan: null,
  lat1: null,
  long1: null,
  remarks: "",
};

// --- Custom Color Picker Component ---
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
          {selectedColor || "Select Cable Color"}
        </span>
        <span className="text-slate-500">▼</span>
      </button>
      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-white border border-slate-300 rounded-md shadow-lg z-20 p-2 grid grid-cols-4 gap-2">
          {CORE_COLORS_DATA.map((color) => (
            <button
              key={color.name}
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

// --- Main Modal Component ---
const AddNodeModal = ({
  isOpen,
  onClose,
  onSave,
  defaultPosition,
  parentNode,
  isInsertion,
}) => {
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (isOpen) {
      const savedData = localStorage.getItem(STORAGE_KEY);
      setFormData(savedData ? JSON.parse(savedData) : initialState);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, isOpen]);

  const clearStorageAndClose = () => {
    localStorage.removeItem(STORAGE_KEY);
    onClose();
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // --- THIS IS THE FIX ---
    // The validation now correctly checks for `formData.node_type`
    if (formData.node_type && formData.name.trim()) {
      let finalObject = {
        ...formData,
        parent_id: parentNode?.id,
        // Convert number fields correctly, providing a null fallback
        lat1: parseFloat(formData.lat1) || null,
        long1: parseFloat(formData.long1) || null,
        split_ratio:
          formData.node_type === "Splitter"
            ? parseInt(formData.split_ratio, 10)
            : null,
        cable_start: formData.cable_start
          ? parseInt(formData.cable_start, 10)
          : null,
        cable_end: formData.cable_end ? parseInt(formData.cable_end, 10) : null,
        cable_length: formData.cable_length ? parseInt(formData.cable_length, 10) : null,
      };

      if (finalObject.brand === "Other") {
        finalObject.brand = finalObject.brand_other;
      }
      delete finalObject.brand_other;

      onSave(finalObject, defaultPosition);
      clearStorageAndClose();
    } else {
      alert("Device Type and Node Name are required.");
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-900/70 z-[100] flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">
        <h3 className="text-2xl font-bold text-slate-800 pb-4 mb-4">
          {isInsertion ? "Insert New Device" : "Add New Node"}
        </h3>
        <div className="overflow-y-auto pr-6 -mr-6 flex-grow">
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
                {DEVICE_TYPES.map((type) => (
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
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="input-style"
                  >
                    {BRAND_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.brand === "Other" ? (
                  <div>
                    <label className="label-style">Custom Brand</label>
                    <input
                      type="text"
                      name="brand_other"
                      value={formData.brand_other}
                      onChange={handleChange}
                      className="input-style"
                      placeholder="Enter brand name"
                    />
                  </div>
                ) : (
                  <div />
                )}
                <div>
                  <label className="label-style">Model</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="input-style"
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
                  />
                </div>
                {formData.node_type === "ONU" && (
                  <>
                    <div>
                      <label className="label-style">MAC</label>
                      <input
                        type="text"
                        name="mac"
                        value={formData.mac}
                        onChange={handleChange}
                        className="input-style"
                        placeholder="--:--:--:--:--:--"
                      />
                    </div>
                    <div>
                      <label className="label-style">IP</label>
                      <input
                        type="text"
                        name="ip"
                        value={formData.ip}
                        onChange={handleChange}
                        className="input-style"
                        placeholder="XXX.XXX.XXX.XXX"
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
                  />
                </div>
              </>
            )}

            {formData.node_type && (
              <>
                <h4 className="md:col-span-2 text-lg font-bold text-slate-700 mt-6">
                  Cable Detail
                </h4>
                <div className="md:col-span-2">
                  <label className="label-style">Cable ID</label>
                  <input
                    type="text"
                    name="cable_id"
                    value={formData.cable_id}
                    onChange={handleChange}
                    className="input-style"
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
                <div className="md:col-span-2">
                  <label className="label-style">Description</label>
                  <input
                    type="text"
                    name="cable_desc"
                    value={formData.cable_desc}
                    onChange={handleChange}
                    className="input-style"
                  />
                </div>
              </>
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
                      />
                    </div>
                  )}
                  <div>
                    <label className="label-style">Latitude</label>
                    <input
                      type="text"
                      name="lat1"
                      value={formData.lat1}
                      onChange={handleChange}
                      className="input-style"
                    />
                  </div>
                  <div>
                    <label className="label-style">Longitude</label>
                    <input
                      type="text"
                      name="long1"
                      value={formData.long1}
                      onChange={handleChange}
                      className="input-style"
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
                  ></textarea>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 border-t border-slate-200 pt-6 mt-8">
          <button onClick={clearStorageAndClose} className="btn-secondary">
            Close
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={!formData.node_type}
          >
            {isInsertion ? "Insert Device" : "Add Node"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNodeModal;
