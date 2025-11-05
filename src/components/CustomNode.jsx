import { memo, useState, useRef } from "react";
import { Handle, Position } from "reactflow";
import { createPortal } from "react-dom";
import { fetchOnuCustomerInfo } from "../utils/graphUtils";
import { useParams } from "react-router-dom";
import { CUST_STATUS, NODE_TYPES_ENUM } from "../utils/enums";
import { UI_ICONS } from "../utils/icons";
import { useIsMobile } from "../utils/useIsMobile";

const ICONS = {
  ap: <img src="/ap.png" alt="Access Point" width="24" height="24" />,
  bamboo: <img src="/bamboo.png" alt="Bamboo" width="24" height="24" />,
  mswitch: <img src="/mswitch.png" alt="mSwitch" width="24" height="24" />,
  uswitch: <img src="/uswitch.png" alt="uSwitch" width="24" height="24" />,
  olt: <img src="/olt.png" alt="OLT" width="24" height="24" />,
  onu: <img src="/onu.png" alt="ONU" width="24" height="24" />,
  pon: <img src="/pon.png" alt="PON Port" width="24" height="24" />,
  router: <img src="/router.png" alt="Router" width="24" height="24" />,
  splitter: <img src="/splitter.png" alt="Splitter" width="24" height="24" />,
  tj: <img src="/tj.png" alt="Transition Joint" width="24" height="24" />,
  other: <img src="/other.png" alt="Other" width="24" height="24" />,
  default: <img src="/other.png" alt="Default" width="24" height="24" />,
};

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
    <dt className="text-xs font-medium text-gray-500 shrink-0 pr-2">{label}</dt>
    <dd className="text-xs text-gray-800 text-right break-words">
      {value || "N/A"}
    </dd>
  </div>
);

const CustomerRow = ({ customer, isExpanded, onExpand }) => {
  const formatMacFoundTime = (diff) => {
    if (!diff) return "N/A";
    let seconds = Math.floor(diff * 100000);

    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds %= 24 * 60 * 60;

    const hours = Math.floor(seconds / (60 * 60));
    seconds %= 60 * 60;

    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}min`);
    if (seconds) parts.push(`${seconds}s`);

    return parts.length ? `${parts.join(" ")} ago` : "Just now";
  };

  const LightbulbIcon = UI_ICONS.lightbulb;

  return (
    <div className="py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>
            <LightbulbIcon
              className={
                customer.online1 === 1 ? "text-yellow-400" : "text-gray-600"
              }
            />
          </span>
          <span>
            {customer.st2 === CUST_STATUS.OK
              ? UI_ICONS.unlock
              : customer.st2 === CUST_STATUS.EXPIRED
              ? UI_ICONS.clock
              : customer.st2 === CUST_STATUS.LOCKED
              ? UI_ICONS.lock
              : customer.st2 === CUST_STATUS.DISABLED
              ? UI_ICONS.timesCircle
              : null}
          </span>
          <span className="font-semibold">{customer.uname}</span>
        </div>
        <div
          onMouseEnter={onExpand}
          className="cursor-pointer p-1 text-gray-400"
        >
          {UI_ICONS.info_main}
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded
            ? "grid-rows-[1fr] opacity-100 mt-2"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <dl className="space-y-2">
            <DetailRow label="Customer ID" value={customer.cid} />
            <DetailRow label="MAC Address" value={customer.mac} />
            <DetailRow
              label="Package Expiry"
              value={new Date(customer.expiry_date).toLocaleString()}
            />
            <DetailRow label="Owner" value={customer.owner} />
            <DetailRow label="User Status" value={customer.st2} />
            <DetailRow
              label="MAC Found"
              value={formatMacFoundTime(customer.diff)}
            />
          </dl>
        </div>
      </div>
    </div>
  );
};

const CustomNode = ({ data, isConnectable }) => {
  const { id } = useParams();
  const [isPopoverVisible, setIsPopoverVisible] = useState(false);
  const [expandedCustomerMac, setExpandedCustomerMac] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const hoverTimeoutRef = useRef(null);
  const nodeRef = useRef(null);
  const isMobile = useIsMobile();

  const loadCustomerData = async () => {
    if (data.node_type === NODE_TYPES_ENUM.ONU && !customerData) {
      setIsLoading(true);
      const result = await fetchOnuCustomerInfo(data.sw_id, data.name);
      setCustomerData(result);
      setIsLoading(false);
    }
  };

  const showCustomerPopover = async () => {
    if (isMobile) return;

    clearTimeout(hoverTimeoutRef.current);

    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }

    setIsPopoverVisible(true);
    await loadCustomerData();
  };

  const startHidePopoverTimer = () => {
    if (isMobile) return;

    hoverTimeoutRef.current = setTimeout(() => {
      setIsPopoverVisible(false);
      setExpandedCustomerMac(null);
    }, 300);
  };

  const cancelHidePopoverTimer = () => {
    if (isMobile) return;
    clearTimeout(hoverTimeoutRef.current);
  };

  const handleShowCustomers = (e) => {
    e.stopPropagation();
    if (data.onShowCustomers) {
      data.onShowCustomers(data);
    }
    setIsPopoverVisible(false);
  };

  let statusBorderClass = "";
  if (data.node_type === NODE_TYPES_ENUM.ONU) {
    if (data.status === 1)
      statusBorderClass =
        "border-r-4 border-t-4 border-r-green-500 border-t-green-500";
    else if (data.status === 2)
      statusBorderClass =
        "border-r-4 border-t-4 border-r-[#d43c3c] border-t-[#d43c3c]";
  }

  const handleDetailsClick = (e) => {
    e.stopPropagation();
    if (isPopoverVisible) {
      setIsPopoverVisible(false);
      setExpandedCustomerMac(null);
    }
    if (data.onDetailsClick) data.onDetailsClick(data);
  };

  const handleNavigateClick = (e) => {
    e.stopPropagation();
    if (data.onNavigateClick) data.onNavigateClick(data.id);
  };

  return (
    <div ref={nodeRef}>
      <div
        className={`p-3 rounded-lg shadow-md flex items-center space-x-3 text-gray-800 ${
          data.isCollapsed ? "bg-gray-300" : "bg-white"
        } border-2 ${
          data.isHighlighted ? "border-blue-500" : "border-gray-400"
        } ${statusBorderClass} transition-all`}
      >
        {id ? (
          data.node_type !== NODE_TYPES_ENUM.OLT && (
            <Handle
              type="target"
              position={Position.Left}
              id="left"
              isConnectableStart={false}
              isConnectableEnd={isConnectable}
              className="!bg-blue-500 !w-3 !h-3"
            />
          )
        ) : (
          <Handle
            type="target"
            position={Position.Left}
            id="left"
            isConnectableStart={false}
            isConnectableEnd={isConnectable}
            className="!bg-blue-500 !w-3 !h-3"
          />
        )}

        <div className="w-6 h-6">{ICONS[data.icon] || ICONS["default"]}</div>
        <div className="text-sm font-semibold">
          {data.label.length > 10
            ? `${data.label.slice(0, 10)}...`
            : data.label}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDetailsClick}
            onMouseEnter={showCustomerPopover}
            onMouseLeave={startHidePopoverTimer}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
            title="View Details"
          >
            {UI_ICONS.info_main}
          </button>

          {data.node_type === NODE_TYPES_ENUM.ONU && isMobile && (
            <button
              onClick={handleShowCustomers}
              className="rounded-full p-1 text-gray-400"
              title="View Customers"
            >
              {UI_ICONS.user}
            </button>
          )}

          {data.node_type === NODE_TYPES_ENUM.OLT && !id && (
            <button
              onClick={handleNavigateClick}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
              title="Go to OLT View"
            >
              {UI_ICONS.chevronRight_main}
            </button>
          )}
        </div>

        {!id
          ? data.node_type !== NODE_TYPES_ENUM.OLT && (
              <Handle
                type="source"
                position={Position.Right}
                id="right"
                isConnectableStart={isConnectable}
                isConnectableEnd={false}
                className="!bg-orange-500 !w-3 !h-3"
              />
            )
          : data.node_type !== NODE_TYPES_ENUM.ONU && (
              <Handle
                type="source"
                position={Position.Right}
                id="right"
                isConnectableStart={isConnectable}
                isConnectableEnd={false}
                className="!bg-orange-500 !w-3 !h-3"
              />
            )}
      </div>

      {isPopoverVisible &&
        !isMobile &&
        data.node_type === NODE_TYPES_ENUM.ONU &&
        createPortal(
          <div
            onMouseEnter={cancelHidePopoverTimer}
            onMouseLeave={startHidePopoverTimer}
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
            }}
            className="fixed z-[9999] w-64 select-text rounded-md bg-white p-3 text-sm font-medium text-gray-800 shadow-md transition-all duration-300 transform -translate-x-1/2 -translate-y-[90%]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                {UI_ICONS.spinner}
                <span>Please wait...</span>
              </div>
            ) : customerData && customerData.length > 0 ? (
              <div className="flex flex-col">
                {customerData.map((customer) => (
                  <CustomerRow
                    key={customer.mac || customer.cid}
                    customer={customer}
                    isExpanded={expandedCustomerMac === customer.mac}
                    onExpand={() => setExpandedCustomerMac(customer.mac)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-gray-500">{UI_ICONS.clear}</span>
                <span>No customer found</span>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

export default memo(CustomNode);
