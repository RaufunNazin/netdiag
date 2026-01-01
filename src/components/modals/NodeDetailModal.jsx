/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { CORE_COLORS_DATA } from "../../utils/constants";
import { fetchNodeDetails } from "../../utils/graphUtils";
import { ICONS } from "../../components/CustomNode.jsx";

const DetailItem = ({ label, value, className = "" }) => {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className={className}>
      <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
        {label}
      </p>
      <p className="text-base text-neutral-800 dark:text-neutral-200 break-words">
        {String(value)}
      </p>
    </div>
  );
};

const LocationMap = ({ lat, lon }) => {
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    lon - 0.01
  },${lat - 0.01},${lon + 0.01},${
    lat + 0.01
  }&layer=mapnik&marker=${lat},${lon}`;

  return (
    <div className="md:col-span-3">
      <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
        Location Map
      </p>
      <iframe
        width="100%"
        height="250"
        className="rounded-lg border border-neutral-300 dark:border-neutral-700"
        src={embedUrl}
        title="Device Location"
        loading="lazy"
      ></iframe>
    </div>
  );
};

const MiniNodeDisplay = ({ nodeData, getNodeIcon }) => {
  if (!nodeData) {
    return (
      <span className="font-normal text-neutral-500 dark:text-neutral-500 ml-2">
        (Unknown Node)
      </span>
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

const CableDetailDisplay = ({
  edge,
  direction,
  otherNodeData,
  getNodeIcon,
}) => {
  const colorName = CORE_COLORS_DATA.find(
    (color) => color.hex === edge.cable_color
  )?.name;

  return (
    <div
      className={`md:col-span-3 p-4 rounded-lg shadow-sm ${
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
        <DetailItem label="Link Type" value={edge.link_type} />
        <DetailItem label="Cable ID" value={edge.cable_id} />
        <DetailItem label="Length (m)" value={edge.cable_length} />
        <DetailItem label="Start Unit" value={edge.cable_start} />
        <DetailItem label="End Unit" value={edge.cable_end} />
        <DetailItem label="Color" value={colorName || edge.cable_color} />
        <DetailItem
          label="Description"
          value={edge.cable_desc}
          className="md:col-span-3"
        />
      </div>
    </div>
  );
};
const NodeDetailModal = ({ isOpen, onClose, node, nodes, getNodeIcon }) => {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCableSectionExpanded, setIsCableSectionExpanded] = useState(false);

  useEffect(() => {
    if (isOpen && node) {
      const loadDetails = async () => {
        setIsLoading(true);
        setDetails(null);
        try {
          const data = await fetchNodeDetails(node.data.id);
          setDetails(data);
        } catch (error) {
          onClose();
        }
        setIsLoading(false);
      };
      loadDetails();
    }
  }, [isOpen, node, onClose]);

  if (!isOpen) return null;

  if (isLoading || !details) {
    return (
      <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div className="w-12 h-12 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { device, incoming_edges, outgoing_edges } = details;

  const hasDeviceSpecifics =
    device.brand ||
    device.model ||
    device.serial_no ||
    device.mac ||
    device.ip ||
    device.vlan;
  const hasSplitterDetails = device.split_ratio || device.split_group;
  const hasCableDetails =
    (incoming_edges && incoming_edges.length > 0) ||
    (outgoing_edges && outgoing_edges.length > 0);
  const hasLocationInfo = device.lat1 && device.long1;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-3xl flex-col rounded-lg bg-white dark:bg-neutral-900 p-4 md:p-8 shadow-md max-h-[90vh] transition-colors">
        <h3 className="mb-6 text-lg md:text-2xl font-bold text-neutral-800 dark:text-neutral-50">
          Device Details: {device.name}
        </h3>

        <div className="flex-grow overflow-y-auto pr-4 -mr-4 custom-scrollbar">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-3">
            <h4 className="col-span-2 md:col-span-3 text-lg font-bold text-neutral-700 dark:text-neutral-200">
              Basic Info
            </h4>
            <DetailItem label="Name" value={device.name} />
            <DetailItem label="Device Type" value={device.node_type} />
            <DetailItem label="System ID (sw_id)" value={device.sw_id} />

            {hasDeviceSpecifics && (
              <>
                <h4 className="col-span-2 md:col-span-3 mt-6 text-lg font-bold text-neutral-700 dark:text-neutral-200">
                  Device Specifics
                </h4>
                <DetailItem label="Brand" value={device.brand} />
                <DetailItem label="Model" value={device.model} />
                <DetailItem label="Serial No" value={device.serial_no} />
                <DetailItem label="MAC Address" value={device.mac} />
                <DetailItem label="IP Address" value={device.ip} />
                <DetailItem label="VLAN" value={device.vlan} />
              </>
            )}

            {hasSplitterDetails && (
              <>
                <h4 className="col-span-2 md:col-span-3 mt-6 text-lg font-bold text-neutral-700 dark:text-neutral-200">
                  Splitter Details
                </h4>
                <DetailItem label="Split Ratio" value={device.split_ratio} />
                <DetailItem label="Split Group" value={device.split_group} />
              </>
            )}

            {hasCableDetails && (
              <>
                <button
                  type="button"
                  className="md:col-span-3 text-neutral-700 dark:text-neutral-200 mt-6 flex items-center text-left justify-between w-full p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-200"
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
                    {incoming_edges.map((edge) => {
                      const otherNodeId = String(edge.source_id);
                      const otherNode = nodes.find((n) => n.id === otherNodeId);
                      if (!otherNode) return null;
                      return (
                        <CableDetailDisplay
                          key={edge.id}
                          edge={edge}
                          direction="Incoming"
                          otherNodeData={otherNode?.data}
                          getNodeIcon={getNodeIcon}
                        />
                      );
                    })}
                    {outgoing_edges.map((edge) => {
                      const otherNodeId = String(edge.target_id);
                      const otherNode = nodes.find((n) => n.id === otherNodeId);
                      if (!otherNode) return null;
                      return (
                        <CableDetailDisplay
                          key={edge.id}
                          edge={edge}
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

            {(hasLocationInfo || device.remarks) && (
              <>
                <h4 className="col-span-2 md:col-span-3 mt-6 text-lg font-bold text-neutral-700 dark:text-neutral-200">
                  Location & Remarks
                </h4>
                <DetailItem label="Latitude" value={device.lat1} />
                <DetailItem label="Longitude" value={device.long1} />
                {hasLocationInfo && (
                  <div className="col-span-2 md:col-span-3">
                    <LocationMap lat={device.lat1} lon={device.long1} />
                  </div>
                )}
                {device.remarks && (
                  <div className="md:col-span-3">
                    <DetailItem label="Remarks" value={device.remarks} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeDetailModal;
