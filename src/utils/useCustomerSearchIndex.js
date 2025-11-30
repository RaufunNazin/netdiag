import { useEffect, useState } from "react";
import {
  fetchCustomerSearchIndex,
  fetchCustomerIndexVersion,
} from "../utils/graphUtils";

const STORAGE_KEY = "customer_search_index";
const VERSION_KEY = "customer_index_version";

const useCustomerSearchIndex = () => {
  const [customerIndex, setCustomerIndex] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    const storedVersion = localStorage.getItem(VERSION_KEY);

    if (storedData) {
      try {
        setCustomerIndex(JSON.parse(storedData));
        setIsReady(true);
      } catch (e) {
        console.error("Failed to parse stored customer index", e);
      }
    }

    const syncData = async () => {
      try {
        const serverVersion = await fetchCustomerIndexVersion();

        if (serverVersion && storedVersion === serverVersion && storedData) {
          console.log("Background: Customer index is up to date.");
          return;
        }

        console.log(
          `Background: Index outdated (Server: ${serverVersion} vs Local: ${storedVersion}). Fetching...`
        );

        const data = await fetchCustomerSearchIndex();

        if (data && data.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          localStorage.setItem(VERSION_KEY, serverVersion || "unknown");
          setCustomerIndex(data);
          setIsReady(true);
          console.log(`Background: Updated index with ${data.length} records.`);
        }
      } catch (error) {
        console.error("Background sync failed:", error);
      }
    };

    const timer = setTimeout(() => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(() => syncData(), { timeout: 5000 });
      } else {
        syncData();
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return { customerIndex, isReady };
};

export default useCustomerSearchIndex;
