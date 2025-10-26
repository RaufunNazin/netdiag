import { memo, useState, useRef } from "react";
import { Handle, Position } from "reactflow";
import { createPortal } from "react-dom";
import { fetchOnuCustomerInfo } from "../utils/graphUtils";
import { useParams } from "react-router-dom";
import { GrClear } from "react-icons/gr";
import { FaUnlock, FaLock, FaClock } from "react-icons/fa6";
import { FaTimesCircle } from "react-icons/fa";
import { CUST_STATUS, NODE_TYPES_ENUM } from "../utils/enums";

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

const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4 text-gray-700"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
    <dt className="text-xs font-medium text-gray-500 shrink-0 pr-2">{label}</dt>
    <dd className="text-xs text-gray-800 text-right break-words">
      {value || "N/A"}
    </dd>
  </div>
);

// NEW: CustomerRow Sub-Component
// This component renders a single customer and manages its own expansion state
// via props passed from the CustomNode.
const CustomerRow = ({ customer, isExpanded, onExpand }) => {
  const onlineStatusColor =
    customer.online1 === 1 ? "bg-green-500" : "bg-red-500";

  const formatMacFoundTime = (diff) => {
    if (!diff) return "N/A";
    // This calculation seems specific to your backend logic, keeping it as is.
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

  return (
    <div className="py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${onlineStatusColor}`}></span>
          <span>
            {customer.st2 === CUST_STATUS.OK ? (
              <FaUnlock className="text-green-500" />
            ) : customer.st2 === CUST_STATUS.EXPIRED ? (
              <FaClock className="text-yellow-300" />
            ) : customer.st2 === CUST_STATUS.LOCKED ? (
              <FaLock className="text-red-500" />
            ) : customer.st2 === CUST_STATUS.DISABLED ? (
              <FaTimesCircle className="text-red-500" />
            ) : null}
          </span>
          <span className="font-semibold">{customer.uname}</span>
        </div>
        <div
          onMouseEnter={onExpand} // Use the onExpand prop to set parent state
          className="cursor-pointer p-1 text-gray-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4M12 8h.01"></path>
          </svg>
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded // Use the isExpanded prop
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
  const [isHovered, setIsHovered] = useState(false);

  // CHANGED: Replaced isDetailsExpanded with expandedCustomerMac
  const [expandedCustomerMac, setExpandedCustomerMac] = useState(null);

  const [customerData, setCustomerData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const hoverTimeoutRef = useRef(null);

  const nodeRef = useRef(null);

  const handleMouseEnterOnIcon = async () => {
    clearTimeout(hoverTimeoutRef.current);

    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top -8,
        left: rect.left + rect.width / 2,
      });
    }

    setIsHovered(true);

    if (data.node_type === NODE_TYPES_ENUM.ONU && !customerData) {
      setIsLoading(true);
      const result = await fetchOnuCustomerInfo(data.sw_id, data.name);
      setCustomerData(result);
      setIsLoading(false);
    }
  };

  const handleMouseLeaveFromArea = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      // CHANGED: Also reset the expanded customer
      setExpandedCustomerMac(null);
    }, 300);
  };

  const handleTooltipMouseEnter = () => {
    clearTimeout(hoverTimeoutRef.current);
  };

  let statusBorderClass = "";
  if (data.node_type === NODE_TYPES_ENUM.ONU) {
    if (data.status === 1)
      statusBorderClass =
        "border-r-4 border-t-4 border-r-green-500 border-t-green-500";
    else if (data.status === 2)
      statusBorderClass =
        "border-r-4 border-t-4 border-r-red-500 border-t-red-500";
  }
  const handleDetailsClick = (e) => {
    e.stopPropagation();
    if (data.onDetailsClick) data.onDetailsClick(data);
  };
  const handleNavigateClick = (e) => {
    e.stopPropagation();
    if (data.onNavigateClick) data.onNavigateClick(data.id);
  };

  // REMOVED: These lines are no longer needed as we are looping
  // const customer =
  //   customerData && customerData.length > 0 ? customerData[0] : null;
  // const onlineStatusColor =
  //   customer && customer.online1 === 1 ? "bg-green-500" : "bg-red-500";

  return (
    <div ref={nodeRef}>
      {" "}
      <div
        className={`p-3 rounded-lg shadow-md flex items-center space-x-3 text-gray-800 ${
          data.isCollapsed ? "bg-gray-300" : "bg-white"
        } border-2 ${
          data.isHighlighted ? "border-red-500" : "border-gray-400"
        } ${statusBorderClass} transition-all`}
      >
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          isConnectableStart={false}
          isConnectableEnd={isConnectable}
          className="!bg-blue-500 !w-3 !h-3"
        />
        <div className="w-6 h-6">{ICONS[data.icon] || ICONS["default"]}</div>
        <div className="text-sm font-semibold">
          {data.label.length > 10
            ? `${data.label.slice(0, 10)}...`
            : data.label}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDetailsClick}
            onMouseEnter={handleMouseEnterOnIcon}
            onMouseLeave={handleMouseLeaveFromArea}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
            title="View Details"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4M12 8h.01"></path>
            </svg>
          </button>
          {data.node_type === NODE_TYPES_ENUM.OLT && !id && (
            <button
              onClick={handleNavigateClick}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
              title="Go to OLT View"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6"></path>
              </svg>
            </button>
          )}
        </div>
        {data.node_type !== "ONU" && (
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
      {isHovered &&
        data.node_type === NODE_TYPES_ENUM.ONU &&
        createPortal(
          <div
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleMouseLeaveFromArea}
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
            }}
            className="fixed z-[9999] w-64 select-text rounded-md bg-white p-3 text-sm font-medium text-gray-800 shadow-md transition-all duration-300 transform -translate-x-1/2 -translate-y-[90%]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner />
                <span>Please wait...</span>
              </div>
            ) : // CHANGED: Check customerData array length instead of single 'customer'
            customerData && customerData.length > 0 ? (
              // CHANGED: Map over the customerData array and render a CustomerRow for each
              <div className="flex flex-col">
                {customerData.map((customer) => (
                  <CustomerRow
                    // Use a unique key, like mac or cid
                    key={customer.mac || customer.cid}
                    customer={customer}
                    // Pass in whether this specific row should be expanded
                    isExpanded={expandedCustomerMac === customer.mac}
                    // Pass in a handler to set this row as expanded
                    onExpand={() => setExpandedCustomerMac(customer.mac)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <GrClear className="mr-2" />
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
