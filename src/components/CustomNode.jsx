/* eslint-disable react-refresh/only-export-components */
import { memo, useState, useRef, useMemo, useEffect } from "react";
import { Handle, Position } from "@xyflow/react";
import { createPortal } from "react-dom";
import { fetchOnuCustomerInfo } from "../utils/graphUtils";
import { useParams } from "react-router-dom";
import { CUST_STATUS, NODE_TYPES_ENUM } from "../utils/enums";
import { UI_ICONS } from "../utils/icons";
import { useIsMobile } from "../utils/useIsMobile";

import apIcon from "../assets/icons/ap.png";
import bambooIcon from "../assets/icons/bamboo.png";
import mswitchIcon from "../assets/icons/mswitch.png";
import uswitchIcon from "../assets/icons/uswitch.png";
import oltIcon from "../assets/icons/olt.png";
import onuIcon from "../assets/icons/onu.png";
import ponIcon from "../assets/icons/pon.png";
import routerIcon from "../assets/icons/router.png";
import splitterIcon from "../assets/icons/splitter.png";
import tjIcon from "../assets/icons/tj.png";
import otherIcon from "../assets/icons/other.png";

export const ICONS = {
  ap: <img src={apIcon} alt="Access Point" width="24" height="24" />,
  bamboo: <img src={bambooIcon} alt="Bamboo" width="24" height="24" />,
  mswitch: <img src={mswitchIcon} alt="mSwitch" width="24" height="24" />,
  uswitch: <img src={uswitchIcon} alt="uSwitch" width="24" height="24" />,
  olt: <img src={oltIcon} alt="OLT" width="24" height="24" />,
  onu: <img src={onuIcon} alt="ONU" width="24" height="24" />,
  pon: <img src={ponIcon} alt="PON Port" width="24" height="24" />,
  router: <img src={routerIcon} alt="Router" width="24" height="24" />,
  splitter: <img src={splitterIcon} alt="Splitter" width="24" height="24" />,
  tj: <img src={tjIcon} alt="Transition Joint" width="24" height="24" />,
  other: <img src={otherIcon} alt="Other" width="24" height="24" />,
  default: <img src={otherIcon} alt="Default" width="24" height="24" />,
};

const DetailRow = ({ label, value }) => (
  // Added dark:border-neutral-800
  <div className="flex justify-between border-t border-neutral-200 dark:border-neutral-800 pt-2 mt-2">
    {/* Added dark:text-neutral-400 */}
    <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400 shrink-0 pr-2">
      {label}
    </dt>
    {/* Added dark:text-neutral-200 */}
    <dd className="text-xs text-neutral-800 dark:text-neutral-200 text-right break-words">
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
    // Added dark:border-neutral-800
    <div className="py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>
            <LightbulbIcon
              className={
                customer.online1 === 1
                  ? "text-yellow-400"
                  : "text-neutral-600 dark:text-neutral-500" // Added dark:text-neutral-500
              }
            />
          </span>
          <span className="dark:text-neutral-300">
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
          {/* Added dark:text-neutral-200 */}
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            {customer.uname}
          </span>
        </div>
        <div
          onMouseEnter={onExpand}
          // Added dark:text-neutral-500 and dark:hover:text-blue-400
          className="cursor-pointer p-1 text-neutral-400 dark:text-neutral-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          {UI_ICONS.info_main}
        </div>
      </div>

      <div
        className={`grid transition-all duration-200 ease-in-out ${
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

const POPOVER_WIDTH_PX = 256;
const POPOVER_PADDING_PX = 16;
const POPOVER_ESTIMATED_HEIGHT = 300;
const POPOVER_MARGIN_PX = 8;
const INITIAL_DISPLAY_LIMIT = 5;

const CustomNode = ({ data, isConnectable, selected }) => {
  const { id } = useParams();
  const [isPopoverVisible, setIsPopoverVisible] = useState(false);
  const [expandedCustomerMac, setExpandedCustomerMac] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const hoverTimeoutRef = useRef(null);
  const nodeRef = useRef(null);
  const popoverRef = useRef(null);
  const inputRef = useRef(null);

  const isMobile = useIsMobile();
  const [popoverDirectionY, setPopoverDirectionY] = useState("up");

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
    setSearchTerm("");
    setShowAll(false);

    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let desiredLeft = rect.left + rect.width / 2 - POPOVER_WIDTH_PX / 2;
      if (desiredLeft < POPOVER_PADDING_PX) {
        desiredLeft = POPOVER_PADDING_PX;
      }
      if (desiredLeft + POPOVER_WIDTH_PX > viewportWidth - POPOVER_PADDING_PX) {
        desiredLeft = viewportWidth - POPOVER_WIDTH_PX - POPOVER_PADDING_PX;
      }

      const spaceAbove = rect.top - POPOVER_MARGIN_PX;
      const spaceBelow = viewportHeight - rect.bottom - POPOVER_MARGIN_PX;

      const popoverFitsAbove =
        spaceAbove > POPOVER_ESTIMATED_HEIGHT || spaceAbove > spaceBelow;

      const newDirection = popoverFitsAbove ? "up" : "down";
      const newTop = newDirection === "up" ? rect.top : rect.bottom;

      setPopoverDirectionY(newDirection);
      setTooltipPosition({ top: newTop, left: desiredLeft });
    }

    setIsPopoverVisible(true);
    await loadCustomerData();
  };

  const startHidePopoverTimer = () => {
    if (isMobile) return;

    hoverTimeoutRef.current = setTimeout(() => {
      if (inputRef.current && document.activeElement === inputRef.current) {
        return;
      }
      setIsPopoverVisible(false);
      setExpandedCustomerMac(null);
      setSearchTerm("");
      setShowAll(false);
    }, 300);
  };

  const cancelHidePopoverTimer = () => {
    if (isMobile) return;
    clearTimeout(hoverTimeoutRef.current);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isPopoverVisible) return;

      const isInsidePopover =
        popoverRef.current && popoverRef.current.contains(event.target);
      const isInsideNode =
        nodeRef.current && nodeRef.current.contains(event.target);

      if (!isInsidePopover && !isInsideNode) {
        setIsPopoverVisible(false);
        setExpandedCustomerMac(null);
        setSearchTerm("");
        setShowAll(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [isPopoverVisible]);

  const handleShowCustomers = (e) => {
    e.stopPropagation();
    if (data.onShowCustomers) {
      data.onShowCustomers(data);
    }
    setIsPopoverVisible(false);
  };

  const borderClass = useMemo(() => {
    // 1. Define base styles for Light AND Dark mode
    // Light: bg-white, border-neutral-400
    // Dark:  dark:bg-neutral-950, dark:border-neutral-700
    const baseStyle = "border-2 bg-white dark:bg-neutral-950";

    if (selected) {
      // Dark: dark:bg-blue-900/40
      return "border-2 border-blue-500 z-50 bg-blue-100 dark:bg-blue-900/40";
    }

    if (data.isHighlighted) {
      // Dark: dark:bg-red-900/40
      return "border-2 border-[#ef4444] bg-red-100 dark:bg-red-900/40";
    }

    if (data.node_type === NODE_TYPES_ENUM.ONU) {
      if (data.status === 1) {
        // Dark: dark:border-neutral-700 (base border) + green right border
        return `${baseStyle} border-neutral-400 dark:border-neutral-700 border-r-4 border-r-green-500`;
      }
      if (data.status === 2) {
        // Dark: dark:border-neutral-700 (base border) + red right border
        return `${baseStyle} border-neutral-400 dark:border-neutral-700 border-r-4 border-r-[#d43c3c]`;
      }
    }

    // Default Node
    return `${baseStyle} border-neutral-400 dark:border-neutral-700`;
  }, [data.isHighlighted, data.node_type, data.status, selected]);

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

  const filteredCustomers = useMemo(() => {
    if (!customerData) return [];
    if (!searchTerm) return customerData;
    const lowerTerm = searchTerm.toLowerCase();

    return customerData.filter((c) => {
      const cid = String(c.cid || "").toLowerCase();
      const mac = String(c.mac || "").toLowerCase();
      const owner = String(c.owner || "").toLowerCase();
      const status = String(c.st2 || "").toLowerCase();
      const onlineStatus = c.online1 === 1 ? "online" : "offline";
      const expiry = c.expiry_date
        ? new Date(c.expiry_date).toLocaleString().toLowerCase()
        : "";

      return (
        cid.includes(lowerTerm) ||
        mac.includes(lowerTerm) ||
        owner.includes(lowerTerm) ||
        status.includes(lowerTerm) ||
        onlineStatus.includes(lowerTerm) ||
        expiry.includes(lowerTerm)
      );
    });
  }, [customerData, searchTerm]);

  const displayedCustomers = useMemo(() => {
    if (showAll) return filteredCustomers;
    return filteredCustomers.slice(0, INITIAL_DISPLAY_LIMIT);
  }, [filteredCustomers, showAll]);

  const remainingCount = filteredCustomers.length - displayedCustomers.length;

  return (
    <div ref={nodeRef}>
      <div
        // Added dark:text-neutral-200
        className={`p-3 rounded-lg shadow-md flex items-center space-x-3 text-neutral-800 dark:text-neutral-200 ${borderClass} transition-all`}
      >
        {id ? (
          data.node_type !== NODE_TYPES_ENUM.OLT && (
            <Handle
              type="target"
              position={Position.Left}
              id="left"
              isConnectableStart={false}
              isConnectableEnd={isConnectable}
              hidden={data.node_type === NODE_TYPES_ENUM.OLT}
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
            // Added dark:text-neutral-500, dark:hover:bg-neutral-800, dark:hover:text-neutral-300
            className="rounded-full p-1 text-neutral-400 dark:text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            title="View Details"
          >
            {UI_ICONS.info_main}
          </button>

          {data.node_type === NODE_TYPES_ENUM.ONU && isMobile && (
            <button
              onClick={handleShowCustomers}
              className="rounded-full p-1 text-neutral-400"
              title="View Customers"
            >
              {UI_ICONS.user}
            </button>
          )}

          {data.node_type === NODE_TYPES_ENUM.OLT && !id && (
            <button
              onClick={handleNavigateClick}
              // Added dark:hover:bg-neutral-800 and dark:hover:text-neutral-300
              className="rounded-full p-1 text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-300"
              title="Go to OLT View"
            >
              {UI_ICONS.chevronRight_main}
            </button>
          )}
        </div>

        {!id ? (
          <Handle
            type="source"
            position={Position.Right}
            id="right"
            isConnectableStart={isConnectable}
            isConnectableEnd={false}
            className="!bg-orange-500 !w-3 !h-3"
          />
        ) : (
          data.node_type !== NODE_TYPES_ENUM.ONU && (
            <Handle
              type="source"
              position={Position.Right}
              id="right"
              isConnectableStart={isConnectable}
              isConnectableEnd={false}
              className="!bg-orange-500 !w-3 !h-3"
            />
          )
        )}
      </div>

      {isPopoverVisible &&
        !isMobile &&
        data.node_type === NODE_TYPES_ENUM.ONU &&
        createPortal(
          <div
            ref={popoverRef}
            onMouseEnter={cancelHidePopoverTimer}
            onMouseLeave={startHidePopoverTimer}
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
            }}
            // Added dark:bg-neutral-900, dark:text-neutral-200
            className={`fixed z-[9999] w-64 select-text rounded-md bg-white dark:bg-neutral-900 p-3 text-sm font-medium text-neutral-800 dark:text-neutral-200 shadow-md transition-all duration-200 transform
              ${
                popoverDirectionY === "up"
                  ? "-translate-y-[100%] mb-2"
                  : "translate-y-0 mt-2"
              }
            `}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                {UI_ICONS.spinner}
                <span>Please wait...</span>
              </div>
            ) : customerData && customerData.length > 0 ? (
              <div className="flex flex-col">
                {customerData.length > 3 && (
                  // Added dark:border-neutral-800
                  <div className="mb-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      // Added dark:border-neutral-700, dark:bg-neutral-950, dark:text-neutral-200
                      className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-2 py-1 text-xs text-neutral-700 dark:text-neutral-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}

                {displayedCustomers.length > 0 ? (
                  <>
                    {displayedCustomers.map((customer) => (
                      <CustomerRow
                        key={customer.mac || customer.cid}
                        customer={customer}
                        isExpanded={expandedCustomerMac === customer.mac}
                        onExpand={() => setExpandedCustomerMac(customer.mac)}
                      />
                    ))}

                    <div className="pt-2 flex justify-center items-center gap-1 text-xs">
                      {!showAll && remainingCount > 0 && (
                        <span className="text-neutral-500">
                          +{remainingCount} more
                        </span>
                      )}

                      {filteredCustomers.length > INITIAL_DISPLAY_LIMIT && (
                        <button
                          onClick={() => setShowAll(!showAll)}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {showAll ? "Show Less" : "Show All"}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="py-2 text-center text-xs text-neutral-500 italic">
                    No matching customers found
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-neutral-500">{UI_ICONS.clear}</span>
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
