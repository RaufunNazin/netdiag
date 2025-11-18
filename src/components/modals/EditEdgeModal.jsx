/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { LINK_TYPES } from "../../utils/constants";
import ColorPicker from "../ui/ColorPicker";
import { fetchEdgeDetails, updateEdgeDetails } from "../../utils/graphUtils";
import { UI_ICONS } from "../../utils/icons";

const EditableField = ({
  label,
  value,
  name,
  onSave,
  type = "text",
  options = [],
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleSaveClick = async () => {
    await onSave(name, currentValue);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setCurrentValue(value);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col">
      <label className="label-style">{label}</label>
      {isEditing ? (
        <div className="flex items-center gap-2">
          {type === "select" ? (
            <select
              value={currentValue || ""}
              onChange={(e) => setCurrentValue(e.target.value)}
              className="input-style flex-grow"
            >
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={currentValue || ""}
              onChange={(e) => setCurrentValue(e.target.value)}
              className="input-style flex-grow"
            />
          )}

          <button
            onClick={handleSaveClick}
            className="btn-primary-sm text-blue-500"
            title="Save"
          >
            {UI_ICONS.check}
          </button>
          <button
            onClick={handleCancelClick}
            className="btn-secondary-sm text-[#ef4444]"
            title="Cancel"
          >
            {UI_ICONS.times}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between input-style bg-slate-50 min-h-[42px]">
          <span className="text-slate-800">
            {value || <span className="text-slate-400">Not set</span>}
          </span>
          <button
            onClick={() => setIsEditing(true)}
            className="text-slate-400 hover:text-blue-600"
            title="Edit"
          >
            {UI_ICONS.pencil || "Edit"}
          </button>
        </div>
      )}
    </div>
  );
};

const EditEdgeModal = ({ edgeId, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && edgeId) {
      const loadEdge = async () => {
        setIsLoading(true);
        try {
          const data = await fetchEdgeDetails(edgeId);
          setFormData(data);
          setOriginalData(data);
        } catch (error) {
          onClose();
        }
        setIsLoading(false);
      };
      loadEdge();
    }
  }, [isOpen, edgeId, onClose]);

  const handleFieldSave = async (fieldName, newValue) => {
    setIsLoading(true);
    let processedValue = newValue;

    const numericFields = ["cable_start", "cable_end", "cable_length"];
    if (numericFields.includes(fieldName)) {
      processedValue = parseInt(newValue, 10) || null;
    }

    const payload = {
      [fieldName]: processedValue,
    };

    try {
      await updateEdgeDetails(edgeId, payload);
      const updatedData = { ...formData, [fieldName]: processedValue };
      setFormData(updatedData);
      setOriginalData(updatedData);
      if (onUpdate) {
        onUpdate(edgeId, fieldName, processedValue);
      }
    } catch (error) {
      setFormData(originalData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(originalData);
    toast.info("Changes have been reset.");
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-slate-900/70 z-[100] flex justify-center items-center p-4">
      <div className="bg-white p-4 md:p-8 rounded-lg shadow-md w-full max-w-2xl max-h-[95vh] flex flex-col">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex justify-center items-center z-20 rounded-lg">
            <div className="w-12 h-12 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <h3 className="text-lg md:text-2xl font-bold text-slate-800 pb-4 mb-4">
          Edit Cable Details
        </h3>

        {formData && (
          <>
            <div className="pr-6 -mr-6 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <EditableField
                    label="Cable ID"
                    name="cable_id"
                    value={formData.cable_id}
                    onSave={handleFieldSave}
                  />
                </div>
                <EditableField
                  label="Link Type"
                  name="link_type"
                  value={formData.link_type}
                  onSave={handleFieldSave}
                  type="select"
                  options={LINK_TYPES}
                />
                <EditableField
                  label="Length (m)"
                  name="cable_length"
                  value={formData.cable_length}
                  onSave={handleFieldSave}
                  type="number"
                />
                <EditableField
                  label="Start Unit"
                  name="cable_start"
                  value={formData.cable_start}
                  onSave={handleFieldSave}
                  type="number"
                />
                <EditableField
                  label="End Unit"
                  name="cable_end"
                  value={formData.cable_end}
                  onSave={handleFieldSave}
                  type="number"
                />
                <div>
                  <label className="label-style">Cable Color</label>
                  <ColorPicker
                    selectedColor={formData.cable_color}
                    onChange={(color) => handleFieldSave("cable_color", color)}
                  />
                </div>
                <div className="md:col-span-2">
                  <EditableField
                    label="Description"
                    name="cable_desc"
                    value={formData.cable_desc}
                    onSave={handleFieldSave}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center border-t border-slate-200 pt-6 mt-8">
              <button
                onClick={onClose}
                className="btn-primary"
                disabled={isLoading}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditEdgeModal;
