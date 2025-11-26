import { useState } from "react";
import { UI_ICONS } from "../../utils/icons";
import { MODE } from "../../utils/enums";

const SearchControl = ({ nodes, onNodeFound, diagramRoots, customerIndex }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [mode, setMode] = useState(MODE.DEVICE);

  const normalize = (str) => {
    return str
      ? str
          .toString()
          .replace(/[^a-zA-Z0-9]/g, "")
          .toLowerCase()
      : "";
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (val.length < 2) {
      setResults([]);
      return;
    }

    const lowerVal = val.toLowerCase();
    const normalizedVal = normalize(val);

    if (mode === MODE.DEVICE) {
      setResults(
        nodes
          .filter((n) => n.data.label.toLowerCase().includes(lowerVal))
          .slice(0, 10)
      );
    } else {
      if (!customerIndex || customerIndex.length === 0) {
        setResults([]);
        return;
      }

      const matches = [];
      for (let i = 0; i < customerIndex.length; i++) {
        const c = customerIndex[i];
        const cidStr = c.cid ? c.cid.toString().toLowerCase() : "";
        const unameStr = c.uname ? c.uname.toString().toLowerCase() : "";
        const macStr = c.mac ? c.mac.toString() : "";
        const normalizedMac = normalize(macStr);

        if (
          cidStr.includes(lowerVal) ||
          unameStr.includes(lowerVal) ||
          macStr.toLowerCase().includes(lowerVal) ||
          normalizedMac.includes(normalizedVal)
        ) {
          matches.push(c);
          if (matches.length >= 10) break;
        }
      }
      setResults(matches);
    }
  };

  const handleSelect = (item) => {
    if (mode === MODE.DEVICE) {
      onNodeFound(item.id);
    } else {
      if (item.onu_id) {
        onNodeFound(String(item.onu_id));
      }
    }
    setQuery("");
    setResults([]);
    setIsFocused(false);
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setQuery("");
    setResults([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && results.length > 0) {
      handleSelect(results[0]);
      e.target.blur();
    }
  };

  const showRootList =
    isFocused &&
    query.length === 0 &&
    results.length === 0 &&
    mode === MODE.DEVICE &&
    (diagramRoots?.main || diagramRoots?.sub?.length > 0);

  return (
    <div className="absolute top-4 right-4 z-10 w-80 flex flex-col gap-2">
      <div className="bg-white/90 rounded-lg backdrop-blur-sm shadow-sm flex items-center p-1.5 border border-slate-200">
        {/* Toggle Switch */}
        <div className="flex bg-slate-100 rounded-md p-0.5 mr-2 shrink-0">
          <button
            onClick={() => handleModeSwitch(MODE.DEVICE)}
            className={`p-1.5 rounded-md transition-all duration-200 flex items-center justify-center ${
              mode === MODE.DEVICE
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
            title="Search Devices"
          >
            {UI_ICONS.device}
          </button>
          <button
            onClick={() => handleModeSwitch(MODE.USER)}
            className={`p-1.5 rounded-md transition-all duration-200 flex items-center justify-center ${
              mode === MODE.USER
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
            title="Search Users"
          >
            {UI_ICONS.user}
          </button>
        </div>

        {/* Input Field */}
        <div className="flex-1 flex items-center">
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={
              mode === MODE.DEVICE ? "Search Devices..." : "Search Users..."
            }
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
          <div className="ml-1 text-slate-400">{UI_ICONS.search}</div>
        </div>
      </div>

      {/* Results Dropdown */}
      {(results.length > 0 || showRootList) && (
        <div className="bg-white/95 rounded-lg border border-slate-200 shadow-lg overflow-hidden max-h-64 overflow-y-auto">
          <ul className="py-1">
            {results.map((item, idx) => (
              <li
                key={idx}
                onClick={() => handleSelect(item)}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0"
              >
                {mode === MODE.DEVICE ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      {item.data.label}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">
                          {item.uname || "Unknown username"}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          Customer ID: {item.cid || "Unknown ID"}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 bg-slate-100 px-1 rounded truncate max-w-[120px] h-fit">
                        ONU: {item.onu_name}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      MAC: {item.mac}
                    </span>
                  </div>
                )}
              </li>
            ))}

            {showRootList && (
              <>
                <li className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                  Roots
                </li>
                {diagramRoots.main && (
                  <li
                    onClick={() => handleSelect(diagramRoots.main)}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                  >
                    <span className="text-sm text-slate-700">
                      {diagramRoots.main.data.label}
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                      Main
                    </span>
                  </li>
                )}
                {diagramRoots.sub.map((node) => (
                  <li
                    key={node.id}
                    onClick={() => handleSelect(node)}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                  >
                    <span className="text-sm text-slate-700">
                      {node.data.label}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                      Sub
                    </span>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchControl;
