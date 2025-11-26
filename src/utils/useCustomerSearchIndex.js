import { useEffect, useState } from "react";
import {
  fetchCustomerSearchIndex,
  fetchCustomerIndexVersion,
} from "../utils/graphUtils";

const STORAGE_KEY = "customer_search_index";
const VERSION_KEY = "customer_index_version"; // New key to store the version string

const useCustomerSearchIndex = () => {
  const [customerIndex, setCustomerIndex] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Load existing data immediately (so UI works instantly)
    const storedData = localStorage.getItem(STORAGE_KEY);
    const storedVersion = localStorage.getItem(VERSION_KEY);

    if (storedData) {
      try {
        setCustomerIndex(JSON.parse(storedData));
        setIsReady(true); // UI is ready with potentially stale data
      } catch (e) {
        console.error("Failed to parse stored customer index", e);
      }
    }

    // 2. Smart Background Sync
    const syncData = async () => {
      try {
        // A. Check Server Version (Tiny Request)
        const serverVersion = await fetchCustomerIndexVersion();

        // B. If versions match, we stop here. Bandwidth saved!
        if (serverVersion && storedVersion === serverVersion && storedData) {
          console.log("Background: Customer index is up to date.");
          return;
        }

        // C. Versions differ (or no local data), fetch the Big Data
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

    // 3. Wait 10s to let the page settle, then run smart sync
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
