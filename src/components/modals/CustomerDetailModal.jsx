import { useState, useEffect, useMemo } from "react";
import { fetchOnuCustomerInfo } from "../../utils/graphUtils";
import { CUST_STATUS, NODE_TYPES_ENUM } from "../../utils/enums";
import { UI_ICONS } from "../../utils/icons";

const INITIAL_DISPLAY_LIMIT = 5;

const DetailRow = ({ label, value }) => (
  // Added dark:border-neutral-800
  <div className="flex justify-between border-t border-neutral-200 dark:border-neutral-800 pt-2 mt-2">
    {/* Added dark:text-neutral-400 */}
    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400 shrink-0 pr-2">
      {label}
    </dt>
    {/* Added dark:text-neutral-200 */}
    <dd className="text-sm text-neutral-800 dark:text-neutral-200 text-right break-words">
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
    <div className="py-3 border-b border-neutral-200 dark:border-neutral-800 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>
            {/* Added dark:text-neutral-500 */}
            <LightbulbIcon
              className={`w-5 h-5 ${
                customer.online1 === 1
                  ? "text-yellow-400"
                  : "text-neutral-600 dark:text-neutral-500"
              }`}
            />
          </span>
          {/* Added dark:text-neutral-300 */}
          <span className="w-5 h-5 dark:text-neutral-300">
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
          {/* Added dark:text-neutral-50 */}
          <span className="font-semibold text-base text-neutral-800 dark:text-neutral-50">
            {customer.uname}
          </span>
        </div>
        <button
          onClick={onExpand}
          // Added dark:text-neutral-500, dark:hover:text-neutral-300
          className="p-1 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-transform duration-200"
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
        className={`grid transition-all duration-200 ease-in-out ${
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

  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (isOpen && nodeData && nodeData.node_type === NODE_TYPES_ENUM.ONU) {
      const loadData = async () => {
        setIsLoading(true);
        setCustomerData([]);
        setExpandedCustomerMac(null);

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

  if (!isOpen || !nodeData) return null;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        // Added dark:bg-neutral-900
        className="flex w-full max-w-lg flex-col bg-white dark:bg-neutral-900 p-4 shadow-md 
                   max-h-[90vh]
                   rounded-lg 
                   md:p-8 transition-colors"
      >
        {/* Added dark:text-neutral-50 */}
        <h3 className="mb-4 text-lg md:text-2xl font-bold text-neutral-800 dark:text-neutral-50">
          Customers on {nodeData.label || nodeData.name}
        </h3>

        {!isLoading && customerData && customerData.length > 3 && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by ID, MAC, Owner, Status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              // Added dark:border-neutral-700, dark:bg-neutral-950, dark:text-neutral-200
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="flex-grow overflow-y-auto pr-4 -mr-4 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 h-32">
              {/* Added dark:text-neutral-400 */}
              <span className="text-neutral-400 dark:text-neutral-500">
                {UI_ICONS.spinner}
              </span>
              <span className="text-neutral-600 dark:text-neutral-400">
                Loading customers...
              </span>
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
                // Added dark:text-neutral-400
                <div className="flex items-center justify-center gap-2 h-20 text-neutral-500 dark:text-neutral-400 text-sm italic">
                  No matching customers found
                </div>
              )}

              {filteredCustomers.length > INITIAL_DISPLAY_LIMIT && (
                // Added dark:border-neutral-800
                <div className="pt-4 flex flex-col justify-center items-center gap-2 border-t border-neutral-100 dark:border-neutral-800 mt-2">
                  {!showAll && remainingCount > 0 && (
                    // Added dark:text-neutral-400
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      +{remainingCount} more customers
                    </span>
                  )}
                  <button
                    onClick={() => setShowAll(!showAll)}
                    // Added dark:text-blue-400, dark:hover:text-blue-300
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                  >
                    {showAll ? "Show Less" : "Show All Customers"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 h-32">
              {/* Added dark:text-neutral-500, dark:text-neutral-400 */}
              <span className="text-neutral-500 dark:text-neutral-500">
                {UI_ICONS.clear}
              </span>
              <span className="text-neutral-600 dark:text-neutral-400">
                No customers found
              </span>
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
