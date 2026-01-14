/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  LINK_TYPES,
  NODE_TYPES,
  DEVICE_TYPES,
  SPLIT_RATIOS,
} from "../../utils/constants";
import ColorPicker from "../ui/ColorPicker";
import SegmentedInput from "../ui/SegmentedInput";
import CustomSelect from "../ui/CustomSelect";
import { NODE_TYPES_ENUM, MISC } from "../../utils/enums";
import { fetchNodeDetails, updateNodeDetails } from "../../utils/graphUtils";
import { ICONS } from "../../components/CustomNode.jsx";

const MiniNodeDisplay = ({ nodeData, getNodeIcon }) => {
  if (!nodeData) {
    return (
      <span className="font-normal text-neutral-500 ml-2">(Unknown Node)</span>
    );
  }
  const iconKey = getNodeIcon(nodeData.node_type);
  return (
    <div className="inline-flex items-center bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded py-1 px-3 ml-2">
      <div className="w-5 h-5">{ICONS[iconKey] || ICONS["default"]}</div>
      <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 ml-1.5">
        {nodeData.label}
      </span>
    </div>
  );
};

const CableDetailForm = ({
  edge,
  onChange,
  direction,
  otherNodeData,
  getNodeIcon,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(edge.id, name, value);
  };

  const handleColorChange = (color) => {
    onChange(edge.id, "cable_color", color);
  };

  return (
    <div
      className={`md:col-span-2 p-4 rounded-lg shadow-sm ${
        direction === "Incoming"
          ? "bg-white dark:bg-neutral-950 border-l-4 border-l-green-400"
          : "bg-white dark:bg-neutral-950 border-l-4 border-l-red-400"
      }`}
    >
      <h5 className="text-base font-bold text-neutral-700 dark:text-neutral-200 mb-4 flex items-center">
        <span>
          {direction} cable {direction === "Incoming" ? "from" : "to"}
        </span>
        <MiniNodeDisplay nodeData={otherNodeData} getNodeIcon={getNodeIcon} />
      </h5>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
        <div>
          <label className="label-style">Link Type</label>
          <CustomSelect
            value={edge.link_type || "Fiber Optic"}
            options={LINK_TYPES}
            onChange={handleChange}
            placeholder="Select Link Type"
          />
        </div>
        <div>
          <label className="label-style">Cable ID</label>
          <input
            type="text"
            name="cable_id"
            value={edge.cable_id || ""}
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
            value={edge.cable_length || ""}
            onChange={handleChange}
            className="input-style"
            placeholder="Enter cable length"
          />
        </div>
        <div>
          <label className="label-style">Start Unit</label>
          <input
            type="number"
            name="cable_start"
            value={edge.cable_start || ""}
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
            value={edge.cable_end || ""}
            onChange={handleChange}
            className="input-style"
            placeholder="Enter end unit"
          />
        </div>
        <ColorPicker
          selectedColor={edge.cable_color}
          onChange={handleColorChange}
        />
        <div className="md:col-span-3">
          <label className="label-style">Description</label>
          <input
            type="text"
            name="cable_desc"
            value={edge.cable_desc || ""}
            onChange={handleChange}
            className="input-style"
            placeholder="Enter cable description"
          />
        </div>
      </div>
    </div>
  );
};

const EditNodeModal = ({
  node,
  isOpen,
  onClose,
  onSave,
  nodes,
  getNodeIcon,
}) => {
  const [deviceData, setDeviceData] = useState(null);
  const [incomingEdges, setIncomingEdges] = useState([]);
  const [outgoingEdges, setOutgoingEdges] = useState([]);
  const [originalState, setOriginalState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCableSectionExpanded, setIsCableSectionExpanded] = useState(false);

  useEffect(() => {
    if (isOpen && node) {
      const loadDetails = async () => {
        setIsLoading(true);
        try {
          const data = await fetchNodeDetails(node.id);
          setDeviceData({
            ...data.device,
            location:
              data.device.lat1 && data.device.long1
                ? `${data.device.lat1}, ${data.device.long1}`
                : "",
          });
          setIncomingEdges(data.incoming_edges);
          setOutgoingEdges(data.outgoing_edges);
          setOriginalState(JSON.parse(JSON.stringify(data)));
        } catch (error) {
          toast.error("Failed to load device details. Closing modal.");
          onClose();
        }
        setIsLoading(false);
      };
      loadDetails();
    } else {
      setDeviceData(null);
      setIncomingEdges([]);
      setOutgoingEdges([]);
      setOriginalState(null);
    }
  }, [isOpen, node, onClose]);

  const handleDeviceChange = (e) => {
    const { name, value } = e.target;
    setDeviceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdgeChange = (edgeId, fieldName, value) => {
    const updater = (edges) =>
      edges.map((edge) =>
        edge.id === edgeId ? { ...edge, [fieldName]: value } : edge
      );

    if (incomingEdges.some((e) => e.id === edgeId)) {
      setIncomingEdges(updater);
    } else if (outgoingEdges.some((e) => e.id === edgeId)) {
      setOutgoingEdges(updater);
    }
  };

  const handleSave = useCallback(async () => {
    if (!originalState) return;
    setIsLoading(true);

    const deviceChanges = {};
    for (const key in deviceData) {
      if (key === "location") continue;
      if (deviceData[key] !== originalState.device[key]) {
        deviceChanges[key] = deviceData[key];
      }
    }

    const originalLocation =
      originalState.device.lat1 && originalState.device.long1
        ? `${originalState.device.lat1}, ${originalState.device.long1}`
        : "";
    if (deviceData.location !== originalLocation) {
      const coords = (deviceData.location || "").split(/[, ]+/).filter(Boolean);
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
      deviceChanges.lat1 = lat;
      deviceChanges.long1 = lon;
    }

    const allEdges = [...incomingEdges, ...outgoingEdges];
    const allOriginalEdges = [
      ...originalState.incoming_edges,
      ...originalState.outgoing_edges,
    ];
    const edgeChanges = [];
    const numericEdgeFields = ["cable_start", "cable_end", "cable_length"];

    for (const edge of allEdges) {
      const originalEdge = allOriginalEdges.find((e) => e.id === edge.id);
      if (!originalEdge) continue;

      const singleEdgePayload = { id: edge.id };
      let hasChange = false;

      for (const key in edge) {
        if (key === "id") continue;
        if (edge[key] !== originalEdge[key]) {
          if (
            numericEdgeFields.includes(key) &&
            typeof edge[key] === MISC.STRING
          ) {
            singleEdgePayload[key] = parseInt(edge[key], 10) || null;
          } else {
            singleEdgePayload[key] = edge[key];
          }
          hasChange = true;
        }
      }

      if (hasChange) {
        edgeChanges.push(singleEdgePayload);
      }
    }

    if (Object.keys(deviceChanges).length === 0 && edgeChanges.length === 0) {
      toast.info("No changes to save.");
      setIsLoading(false);
      onClose();
      return;
    }

    const numericDeviceFields = ["split_ratio"];
    for (const field of numericDeviceFields) {
      if (
        field in deviceChanges &&
        typeof deviceChanges[field] === MISC.STRING
      ) {
        deviceChanges[field] = parseInt(deviceChanges[field], 10) || null;
      }
    }

    const payload = {
      device_data: deviceChanges,
      edges_to_update: edgeChanges,
    };

    try {
      await updateNodeDetails(node.id, payload);
      onSave();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [originalState, deviceData, incomingEdges, outgoingEdges, onClose, node.id, onSave]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen && e.key === "Enter") {
        // Prevent triggering save if the user is typing in the Remarks textarea
        if (e.target.tagName === "TEXTAREA") return;

        e.preventDefault();
        // Only save if not currently loading
        if (!isLoading) {
          handleSave();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, handleSave]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-neutral-900/70 z-[100] flex justify-center items-center p-4">
      <div className="bg-white dark:bg-neutral-900 p-4 md:p-8 rounded-lg shadow-md w-full max-w-4xl max-h-[95vh] flex flex-col transition-colors">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 flex justify-center items-center z-20 rounded-lg backdrop-blur-[1px]">
            <div className="w-12 h-12 border-3 border-neutral-200 dark:border-neutral-800 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        <h3 className="text-lg md:text-2xl font-bold text-neutral-800 dark:text-neutral-50 pb-4 mb-4">
          Edit Device Details
        </h3>

        {deviceData && (
          <>
            <div className="overflow-y-auto pr-6 -mr-6 flex-grow custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <h4 className="md:col-span-2 text-lg font-bold text-neutral-700 dark:text-neutral-200 mt-2">
                  General Information
                </h4>
                <div className="md:col-span-2">
                  <label className="label-style">
                    Name <span className="text-[#d43c3c]">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={deviceData.name}
                    onChange={handleDeviceChange}
                    className="input-style"
                    placeholder="Enter device name"
                  />
                </div>
                <div>
                  <label className="label-style">
                    Device <span className="text-[#d43c3c]">*</span>
                  </label>
                  <CustomSelect
                    value={deviceData.node_type}
                    options={NODE_TYPES}
                    onChange={(e) =>
                      handleDeviceChange({
                        target: { name: "node_type", value: e.target.value },
                      })
                    }
                    placeholder="Select Device Type"
                  />
                </div>

                <h4 className="md:col-span-2 text-lg font-bold text-neutral-700 dark:text-neutral-200 mt-6">
                  Device Details
                </h4>
                <div>
                  <label className="label-style">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={deviceData.brand || ""}
                    onChange={handleDeviceChange}
                    className="input-style"
                    placeholder="Enter brand name"
                  />
                </div>
                <div>
                  <label className="label-style">Model</label>
                  <input
                    type="text"
                    name="model"
                    value={deviceData.model || ""}
                    onChange={handleDeviceChange}
                    className="input-style"
                    placeholder="Enter model name"
                  />
                </div>
                <div>
                  <label className="label-style">Serial No</label>
                  <input
                    type="text"
                    name="serial_no"
                    value={deviceData.serial_no || ""}
                    onChange={handleDeviceChange}
                    className="input-style"
                    placeholder="Enter serial number"
                  />
                </div>

                {deviceData.node_type === NODE_TYPES_ENUM.ONU && (
                  <>
                    <div>
                      <label className="label-style">Device Type</label>
                      <CustomSelect
                        value={deviceData.device_type}
                        options={DEVICE_TYPES}
                        onChange={(e) =>
                          handleDeviceChange({
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
                        value={deviceData.mac || ""}
                        onChange={(macValue) =>
                          handleDeviceChange({
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
                        value={deviceData.ip || ""}
                        onChange={(ipValue) =>
                          handleDeviceChange({
                            target: { name: "ip", value: ipValue },
                          })
                        }
                        inputMode="numeric"
                      />
                    </div>
                  </>
                )}

                {deviceData.node_type === NODE_TYPES_ENUM.SPLITTER && (
                  <>
                    <h4 className="md:col-span-2 text-lg font-bold text-neutral-700 dark:text-neutral-200 mt-6">
                      Splitter Details
                    </h4>
                    <div>
                      <label className="label-style">
                        Split Ratio <span className="text-[#d43c3c]">*</span>
                      </label>
                      <CustomSelect
                        placeholder="Select Ratio"
                        value={deviceData.split_ratio}
                        options={SPLIT_RATIOS}
                        onChange={(e) =>
                          handleDeviceChange({
                            target: {
                              name: "split_ratio",
                              value: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="label-style">Split Color Group</label>
                      <CustomSelect
                        placeholder="Select Group"
                        value={deviceData.split_group}
                        options={["A", "B"]}
                        onChange={(e) =>
                          handleDeviceChange({
                            target: {
                              name: "split_group",
                              value: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="label-style block mb-1">
                        Split Color
                      </label>
                      <ColorPicker
                        selectedColor={deviceData.split_color}
                        onChange={(color) =>
                          handleDeviceChange({
                            target: { name: "split_color", value: color },
                          })
                        }
                      />
                    </div>
                  </>
                )}
                {(incomingEdges.length > 0 || outgoingEdges.length > 0) && (
                  <>
                    <button
                      type="button"
                      className="md:col-span-2 text-neutral-700 dark:text-neutral-200 mt-6 flex items-center text-left justify-between w-full p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-200"
                      onClick={() => setIsCableSectionExpanded((prev) => !prev)}
                    >
                      <div className="text-lg font-bold flex items-center gap-2">
                        <span
                          className={`transition-transform ${
                            isCableSectionExpanded ? "rotate-90" : ""
                          }`}
                        >
                          ▶
                        </span>
                        Cable Details
                      </div>

                      <span className="text-neutral-500 dark:text-neutral-400">
                        Click to toggle
                      </span>
                    </button>
                    {isCableSectionExpanded && (
                      <>
                        {incomingEdges.length === 0 &&
                          outgoingEdges.length === 0 && (
                            <p className="md:col-span-2 text-neutral-500 dark:text-neutral-400 italic">
                              No cables are connected to this device.
                            </p>
                          )}
                        {incomingEdges.map((edge) => {
                          const otherNodeId = String(edge.source_id);
                          const otherNode = nodes.find(
                            (n) => n.id === otherNodeId
                          );

                          if (!otherNode) {
                            return null;
                          }

                          return (
                            <CableDetailForm
                              key={edge.id}
                              edge={edge}
                              onChange={handleEdgeChange}
                              direction="Incoming"
                              otherNodeData={otherNode?.data}
                              getNodeIcon={getNodeIcon}
                            />
                          );
                        })}
                        {outgoingEdges.map((edge) => {
                          const otherNodeId = String(edge.target_id);
                          const otherNode = nodes.find(
                            (n) => n.id === otherNodeId
                          );

                          if (!otherNode) {
                            return null;
                          }

                          return (
                            <CableDetailForm
                              key={edge.id}
                              edge={edge}
                              onChange={handleEdgeChange}
                              direction="Outgoing"
                              otherNodeData={otherNode?.data}
                              getNodeIcon={getNodeIcon}
                            />
                          );
                        })}
                      </>
                    )}
                  </>
                )}
                <h4 className="md:col-span-2 text-lg font-bold text-neutral-700 dark:text-neutral-200 mt-6">
                  Other Information
                </h4>
                <div
                  className={`md:col-span-2 grid grid-cols-1 ${
                    deviceData.node_type === NODE_TYPES_ENUM.ONU
                      ? "md:grid-cols-3"
                      : "md:grid-cols-2"
                  } gap-x-8 gap-y-6`}
                >
                  {deviceData.node_type === NODE_TYPES_ENUM.ONU && (
                    <div>
                      <label className="label-style">VLAN</label>
                      <input
                        type="text"
                        name="vlan"
                        value={deviceData.vlan || ""}
                        onChange={handleDeviceChange}
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
                      value={deviceData.location || ""}
                      onChange={handleDeviceChange}
                      className="input-style"
                      placeholder="Enter latitude, longitude"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="label-style">Remarks</label>
                  <textarea
                    name="remarks"
                    value={deviceData.remarks || ""}
                    onChange={handleDeviceChange}
                    className="input-style"
                    rows="3"
                    placeholder="Enter any remarks"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 border-t border-neutral-200 dark:border-neutral-800 pt-6 mt-8">
              <button
                onClick={onClose}
                className="btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditNodeModal;
