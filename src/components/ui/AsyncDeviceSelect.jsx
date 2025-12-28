import { useState, useEffect, useRef } from "react";
import api from "../../api";
import { UI_ICONS } from "../../utils/icons";

const AsyncDeviceSelect = ({ label, placeholder, onSelect, selectedItem }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const { data } = await api.get(`/search/devices?q=${query}`);
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    onSelect(item);
    setIsOpen(false);
    setQuery("");
  };

  const clearSelection = () => {
    onSelect(null);
    setQuery("");
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {selectedItem ? (
        <div
          className={`flex items-center justify-between w-full p-2 rounded-lg border transition-colors ${
            label === "Source"
              ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
              : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
          }`}
        >
          <div className="flex flex-col overflow-hidden">
            <span
              className={`text-[10px] font-bold uppercase ${
                label === "Source"
                  ? "text-green-600 dark:text-green-400"
                  : "text-blue-600 dark:text-blue-400"
              }`}
            >
              {label}
            </span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
              {selectedItem.name}
            </span>
          </div>
          <button
            onClick={clearSelection}
            className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 p-1 transition-colors"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            placeholder={placeholder || "Type to search..."}
            className="w-full p-2.5 pl-9 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500"
          />
          <div className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500">
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-slate-400 dark:border-slate-500 border-t-transparent rounded-full" />
            ) : (
              UI_ICONS.search
            )}
          </div>
        </div>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {results.map((node) => (
            <div
              key={node.id}
              onClick={() => handleSelect(node)}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-50 dark:border-slate-700/50 last:border-0 flex items-center justify-between group transition-colors"
            >
              <span className="text-sm text-slate-700 dark:text-slate-200 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {node.name}
              </span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                {node.node_type}
              </span>
            </div>
          ))}
        </div>
      )}

      {isOpen && results.length === 0 && query.length >= 2 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-3 text-center text-xs text-slate-500 dark:text-slate-400">
          No devices found.
        </div>
      )}
    </div>
  );
};

export default AsyncDeviceSelect;
