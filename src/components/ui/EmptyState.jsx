import React from "react";

const EmptyState = () => {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-4">
      <div className="text-gray-400">
        {/* Disconnected Network Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
          <line x1="12" y1="20" x2="12" y2="20"></line>
        </svg>
      </div>
      <h2 className="mt-6 text-2xl font-semibold text-gray-700">
        No Devices Found
      </h2>
      <p className="mt-2 text-gray-500">
        Your network view is currently empty.
      </p>
      <p className="mt-2 text-gray-700 font-medium">
        Click the plus button below to add your first device.
      </p>
    </div>
  );
};

export default EmptyState;
