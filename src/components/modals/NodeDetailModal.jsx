import { CORE_COLORS_DATA } from "../../utils/constants";

const DetailItem = ({ label, value }) => {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="text-base text-slate-800 break-words">{String(value)}</p>
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
      <p className="text-sm font-semibold text-slate-500 mb-2">Location Map</p>
      <iframe
        width="100%"
        height="250"
        className="rounded-lg border border-slate-300"
        src={embedUrl}
        title="Device Location"
        loading="lazy"
      ></iframe>
    </div>
  );
};

const NodeDetailModal = ({ isOpen, onClose, node }) => {
  if (!isOpen || !node) return null;

  const { data } = node;

  const hasDeviceSpecifics =
    data.brand ||
    data.model ||
    data.serial_no ||
    data.mac ||
    data.ip ||
    data.vlan;
  const hasSplitterDetails = data.split_ratio || data.split_group;
  const hasCableDetails =
    data.cable_id ||
    data.cable_length ||
    data.cable_color ||
    data.cable_start ||
    data.cable_end ||
    data.cable_desc;
  const hasLocationInfo = data.lat1 && data.long1;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-3xl flex-col rounded-lg bg-white p-8 shadow-2xl max-h-[90vh]">
        <h3 className="mb-6 text-2xl font-bold text-slate-800">
          Device Details: {data.label || data.name}
        </h3>

        <div className="flex-grow overflow-y-auto pr-4 -mr-4">
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-3">
            <h4 className="md:col-span-3 text-lg font-bold text-slate-700">
              Basic Info
            </h4>
            <DetailItem label="Name" value={data.label || data.name} />
            <DetailItem label="Device Type" value={data.node_type} />
            <DetailItem label="Link Type" value={data.link_type} />
            <DetailItem label="System ID (sw_id)" value={data.sw_id} />

            {hasDeviceSpecifics && (
              <>
                <h4 className="md:col-span-3 mt-6 text-lg font-bold text-slate-700">
                  Device Specifics
                </h4>
                <DetailItem label="Brand" value={data.brand} />
                <DetailItem label="Model" value={data.model} />
                <DetailItem label="Serial No" value={data.serial_no} />
                <DetailItem label="MAC Address" value={data.mac} />
                <DetailItem label="IP Address" value={data.ip} />
                <DetailItem label="VLAN" value={data.vlan} />
              </>
            )}

            {hasSplitterDetails && (
              <>
                <h4 className="md:col-span-3 mt-6 text-lg font-bold text-slate-700">
                  Splitter Details
                </h4>
                <DetailItem label="Split Ratio" value={data.split_ratio} />
                <DetailItem label="Split Group" value={data.split_group} />
              </>
            )}

            {hasCableDetails && (
              <>
                <h4 className="md:col-span-3 mt-6 text-lg font-bold text-slate-700">
                  Cable Details
                </h4>
                <DetailItem label="Cable ID" value={data.cable_id} />
                <DetailItem label="Length (m)" value={data.cable_length} />
                <DetailItem
                  label="Color"
                  value={
                    CORE_COLORS_DATA.find(
                      (color) => color.hex === data.cable_color
                    )?.name
                  }
                />
                <DetailItem label="Start Unit" value={data.cable_start} />
                <DetailItem label="End Unit" value={data.cable_end} />
                <DetailItem
                  label="Description"
                  value={data.cable_desc}
                  className="md:col-span-2"
                />
              </>
            )}

            {(hasLocationInfo || data.remarks) && (
              <>
                <h4 className="md:col-span-3 mt-6 text-lg font-bold text-slate-700">
                  Location & Remarks
                </h4>
                <DetailItem label="Latitude" value={data.lat1} />
                <DetailItem label="Longitude" value={data.long1} />
                {hasLocationInfo && (
                  <LocationMap lat={data.lat1} lon={data.long1} />
                )}
                {data.remarks && (
                  <div className="md:col-span-3">
                    <DetailItem label="Remarks" value={data.remarks} />
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
