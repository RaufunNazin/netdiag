// src/components/ui/OltSelector.jsx

import React from "react";

const OltSelector = ({ olts, selectedOlt, onChange, isLoading }) => {
  return (
    <div className="absolute top-4 left-4 z-20 bg-white/90 p-2 rounded-lg shadow-lg w-72">
      <select
        value={selectedOlt || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      >
        <option value="" disabled>
          -- Select an OLT --
        </option>
        {olts.map((olt) => (
          <option key={olt.id} value={olt.id}>
            {olt.name} [{olt.olt_type} - {olt.ip}]
          </option>
        ))}
      </select>
    </div>
  );
};

export default OltSelector;