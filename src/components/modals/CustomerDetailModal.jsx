import { useState, useEffect, useMemo } from "react";
import { fetchOnuCustomerInfo } from "../../utils/graphUtils";
import { CUST_STATUS, NODE_TYPES_ENUM } from "../../utils/enums";
import { UI_ICONS } from "../../utils/icons";

const INITIAL_DISPLAY_LIMIT = 5;

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
    <dt className="text-sm font-medium text-slate-500 shrink-0 pr-2">
      {label}
    </dt>
    <dd className="text-sm text-slate-800 text-right break-words">
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
    <div className="py-3 border-b border-slate-200 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>
            <LightbulbIcon
              className={`w-5 h-5 ${
                customer.online1 === 1 ? "text-yellow-400" : "text-slate-600"
              }`}
            />
          </span>
          <span className="w-5 h-5">
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
          <span className="font-semibold text-base text-slate-800">
            {customer.uname}
          </span>
        </div>
        <button
          onClick={onExpand}
          className="p-1 text-slate-400 hover:text-slate-700 transition-transform duration-200"
        >
          <span
            className={`inline-block transform transition-transform duration-200 ${
              isExpanded ? "rotate-0" : "rotate-180"
            }`}
          >
            {UI_ICONS.chevronUp}
          </span>
        </button>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded
            ? "grid-rows-[1fr] opacity-100 mt-3"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <dl className="space-y-2 pl-8">
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

const CustomerDetailModal = ({ isOpen, onClose, nodeData }) => {
  const [customerData, setCustomerData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCustomerMac, setExpandedCustomerMac] = useState(null);

  // Search and Display State
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (isOpen && nodeData && nodeData.node_type === NODE_TYPES_ENUM.ONU) {
      const loadData = async () => {
        setIsLoading(true);
        setCustomerData([]);
        setExpandedCustomerMac(null);

        // Reset filters on open
        setSearchTerm("");
        setShowAll(false);

        const result = await fetchOnuCustomerInfo(
          nodeData.sw_id,
          nodeData.name
        );
        setCustomerData(result);
        setIsLoading(false);
      };
      loadData();
    }
  }, [isOpen, nodeData]);

  // Filter Logic
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

  // Pagination Logic
  const displayedCustomers = useMemo(() => {
    if (showAll) return filteredCustomers;
    return filteredCustomers.slice(0, INITIAL_DISPLAY_LIMIT);
  }, [filteredCustomers, showAll]);

  const remainingCount = filteredCustomers.length - displayedCustomers.length;

  if (!isOpen || !nodeData) return null;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className="flex w-full max-w-lg flex-col bg-white p-4 shadow-md 
                   max-h-[90vh]
                   rounded-lg 
                   md:p-8"
      >
        <h3 className="mb-4 text-lg md:text-2xl font-bold text-slate-800">
          Customers on {nodeData.label || nodeData.name}
        </h3>

        {/* Search Bar */}
        {!isLoading && customerData && customerData.length > 3 && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by ID, MAC, Owner, Status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="flex-grow overflow-y-auto pr-4 -mr-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 h-32">
              {UI_ICONS.spinner}
              <span className="text-slate-600">Loading customers...</span>
            </div>
          ) : customerData && customerData.length > 0 ? (
            <div className="flex flex-col">
              {displayedCustomers.length > 0 ? (
                displayedCustomers.map((customer) => (
                  <CustomerRow
                    key={customer.mac || customer.cid}
                    customer={customer}
                    isExpanded={expandedCustomerMac === customer.mac}
                    onExpand={() =>
                      setExpandedCustomerMac(
                        expandedCustomerMac === customer.mac
                          ? null
                          : customer.mac
                      )
                    }
                  />
                ))
              ) : (
                <div className="flex items-center justify-center gap-2 h-20 text-slate-500 text-sm italic">
                  No matching customers found
                </div>
              )}

              {/* Show All / Show Less Controls */}
              {filteredCustomers.length > INITIAL_DISPLAY_LIMIT && (
                <div className="pt-4 flex flex-col justify-center items-center gap-2 border-t border-slate-100 mt-2">
                  {!showAll && remainingCount > 0 && (
                    <span className="text-sm text-slate-500">
                      +{remainingCount} more customers
                    </span>
                  )}
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {showAll ? "Show Less" : "Show All Customers"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 h-32">
              <span className="text-slate-500">{UI_ICONS.clear}</span>
              <span className="text-slate-600">No customers found</span>
            </div>
          )}
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

export default CustomerDetailModal;
