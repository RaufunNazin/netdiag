import { useState, useEffect } from "react";
import {
  LINK_TYPES,
  NODE_TYPES,
  DEVICE_TYPES,
  SPLIT_RATIOS,
} from "../../utils/constants";
import SegmentedInput from "../ui/SegmentedInput";
import ColorPicker from "../ui/ColorPicker";
import CustomSelect from "../ui/CustomSelect";
import { NODE_TYPES_ENUM, MISC } from "../../utils/enums";

const STORAGE_KEY = "addNodeFormData";

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
  split_ratio: null,
  split_group: "",
  split_color: "",
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
      const savedDataJSON = localStorage.getItem(STORAGE_KEY);
      let dataToSet = savedDataJSON
        ? JSON.parse(savedDataJSON)
        : { ...initialState };

      if (dataToSet.lat1 && dataToSet.long1) {
        dataToSet.location = `${dataToSet.lat1}, ${dataToSet.long1}`;
      } else {
        dataToSet.location = "";
      }

      setFormData(dataToSet);
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
    if (formData.node_type && formData.name.trim()) {
      let finalObject = { ...formData, parent_id: parentNode?.id };

      const locationString = finalObject.location || "";
      const coords = locationString.split(/[, ]+/).filter(Boolean);
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
      finalObject.lat1 = lat;
      finalObject.long1 = lon;
      delete finalObject.location;

      finalObject.split_ratio =
        formData.node_type === NODE_TYPES_ENUM.SPLITTER
          ? parseInt(formData.split_ratio, 10) || null
          : null;
      finalObject.cable_start = formData.cable_start
        ? parseInt(formData.cable_start, 10)
        : null;
      finalObject.cable_end = formData.cable_end
        ? parseInt(formData.cable_end, 10)
        : null;
      finalObject.cable_length = formData.cable_length
        ? parseInt(formData.cable_length, 10)
        : null;

      if (finalObject.brand === MISC.OTHER) {
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
      <div className="bg-white p-4 md:p-8 rounded-lg shadow-md w-full max-w-4xl max-h-[95vh] flex flex-col">
        <h3 className="text-lg md:text-2xl font-bold text-slate-800 pb-4 mb-4">
          {isInsertion ? "Insert New Device" : "Add New Node"}
        </h3>
        <div className="overflow-y-auto pr-6 -mr-6 flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <h4 className="md:col-span-2 text-lg font-bold text-slate-700 mt-2">
              Basic Info
            </h4>
            <div>
              <label className="label-style">
                Name <span className="text-[#d43c3c]">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-style"
                placeholder="Enter node name"
              />
            </div>
            {isInsertion && (
              <div>
                <label className="label-style">Link Type</label>
                <CustomSelect
                  value={formData.link_type}
                  options={LINK_TYPES}
                  onChange={(e) =>
                    handleChange({
                      target: { name: "link_type", value: e.target.value },
                    })
                  }
                  placeholder="Select Link Type"
                />
              </div>
            )}
            <div>
              <label className="label-style">
                Node Type <span className="text-[#d43c3c]">*</span>
              </label>
              <CustomSelect
                value={formData.node_type}
                options={NODE_TYPES}
                onChange={(e) =>
                  handleChange({
                    target: { name: "node_type", value: e.target.value },
                  })
                }
                placeholder="Select Node Type"
              />
            </div>
            {
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
                {formData.node_type === NODE_TYPES_ENUM.ONU && (
                  <>
                    <div>
                      <label className="label-style">Device Type</label>
                      <CustomSelect
                        value={formData.device_type}
                        options={DEVICE_TYPES}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: "device_type",
                              value: e.target.value,
                            },
                          })
                        }
                        placeholder="Select Device Type"
                      />
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
            }
            {formData.node_type === NODE_TYPES_ENUM.SPLITTER && (
              <>
                <h4 className="md:col-span-2 text-lg font-bold text-slate-700 mt-6">
                  Splitter Detail
                </h4>
                <div>
                  <label className="label-style">
                    Split Ratio <span className="text-[#d43c3c]">*</span>
                  </label>
                  <CustomSelect
                    value={formData.split_ratio}
                    options={SPLIT_RATIOS}
                    onChange={(e) =>
                      handleChange({
                        target: { name: "split_ratio", value: e.target.value },
                      })
                    }
                    placeholder="Select Split Ratio"
                  />
                </div>
                <div>
                  <label className="label-style">Split Group</label>
                  <CustomSelect
                    placeholder="Select Group"
                    value={formData.split_group}
                    options={["A", "B"]}
                    onChange={(e) =>
                      handleChange({
                        target: {
                          name: "split_group",
                          value: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="label-style block mb-1">Split Color</label>
                  <ColorPicker
                    selectedColor={formData.split_color}
                    onChange={(color) =>
                      handleChange({
                        target: { name: "split_color", value: color },
                      })
                    }
                  />
                </div>
              </>
            )}
            {formData.node_type && isInsertion && (
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
            {
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <h4 className="md:col-span-3 text-lg font-bold text-slate-700 mt-6">
                  Other Info
                </h4>
                <div className="flex flex-col gap-y-6">
                  {formData.node_type === NODE_TYPES_ENUM.ONU && (
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
              </div>
            }
          </div>
        </div>

        <div className="flex justify-end space-x-3 border-t border-slate-200 pt-6 mt-8">
          <button onClick={clearStorageAndClose} className="btn-secondary">
            Close
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={!formData.name || !formData.node_type}
          >
            {isInsertion ? "Insert Device" : "Add Node"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNodeModal;
