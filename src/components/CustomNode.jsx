/* eslint-disable react-refresh/only-export-components */
import { memo, useState, useRef, useMemo, useEffect } from "react";
import { Handle, Position } from "reactflow";
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
  <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
    <dt className="text-xs font-medium text-slate-500 shrink-0 pr-2">
      {label}
    </dt>
    <dd className="text-xs text-slate-800 text-right break-words">
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
    <div className="py-2 border-b border-slate-100 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>
            <LightbulbIcon
              className={
                customer.online1 === 1 ? "text-yellow-400" : "text-slate-600"
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
          className="cursor-pointer p-1 text-slate-400"
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

const POPOVER_WIDTH_PX = 256;
const POPOVER_PADDING_PX = 16;
const POPOVER_ESTIMATED_HEIGHT = 300;
const POPOVER_MARGIN_PX = 8;
const INITIAL_DISPLAY_LIMIT = 5;

const CustomNode = ({ data, isConnectable }) => {
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

  // UPDATED: Click Outside Listener with Capture Phase
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If popover is not visible, do nothing
      if (!isPopoverVisible) return;

      // Check if click is inside the popover OR inside the node (trigger)
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

    // Use 'true' for useCapture to catch events before React Flow stops them
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
    if (data.isHighlighted) {
      return "border-4 border-blue-500";
    }

    if (data.node_type === NODE_TYPES_ENUM.ONU) {
      if (data.status === 1) {
        return "border-2 border-slate-400 border-r-4 border-t-4 border-r-green-500 border-t-green-500";
      }
      if (data.status === 2) {
        return "border-2 border-slate-400 border-r-4 border-t-4 border-r-[#d43c3c] border-t-[#d43c3c]";
      }
    }

    return "border-2 border-slate-400";
  }, [data.isHighlighted, data.node_type, data.status]);

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
        className={`p-3 rounded-lg shadow-md flex items-center space-x-3 text-slate-800 ${
          data.isCollapsed ? "bg-slate-300" : "bg-white"
        } ${borderClass} transition-all`}
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
            className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            title="View Details"
          >
            {UI_ICONS.info_main}
          </button>

          {data.node_type === NODE_TYPES_ENUM.ONU && isMobile && (
            <button
              onClick={handleShowCustomers}
              className="rounded-full p-1 text-slate-400"
              title="View Customers"
            >
              {UI_ICONS.user}
            </button>
          )}

          {data.node_type === NODE_TYPES_ENUM.OLT && !id && (
            <button
              onClick={handleNavigateClick}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
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
            className={`fixed z-[9999] w-64 select-text rounded-md bg-white p-3 text-sm font-medium text-slate-800 shadow-md transition-all duration-300 transform
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
                  <div className="mb-2 border-b border-slate-100 pb-2">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
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
                        <span className="text-slate-500">
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
                  <div className="py-2 text-center text-xs text-slate-500 italic">
                    No matching customers found
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-slate-500">{UI_ICONS.clear}</span>
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
