import React, { useState, useEffect } from "react";
import { FaChevronUp } from "react-icons/fa";

const IconDock = ({ children }) => {
  // State to manage visibility, initialized from localStorage (no change here)
  const [isOpen, setIsOpen] = useState(() => {
    const savedState = localStorage.getItem("isDockOpen");
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  // Effect to save the state to localStorage (no change here)
  useEffect(() => {
    localStorage.setItem("isDockOpen", JSON.stringify(isOpen));
  }, [isOpen]);

  const toggleDock = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    // Main container: Centered at the bottom with a frosted glass effect
    <div
      className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 
                 items-center rounded-full border border-gray-200/70 
                 bg-white/50 p-2 shadow-lg backdrop-blur-md"
    >
      {/* The content area for the icons. (No changes here) */}
      <div
        className={`flex items-center gap-2 overflow-hidden transition-all 
                   duration-500 ease-in-out
                   ${isOpen ? "max-w-md opacity-100" : "max-w-0 opacity-0"}`}
      >
        {children}
      </div>

      {/* The toggle button */}
      <button
        onClick={toggleDock}
        // --- THIS IS THE FIX ---
        // Add transition classes to animate the margin change smoothly
        className={`flex h-10 w-10 shrink-0 items-center justify-center 
                   rounded-full bg-transparent text-gray-600 transition-all 
                   duration-500 ease-in-out ${isOpen ? "ml-2" : "ml-0"}`}
        title={isOpen ? "Hide Toolbar" : "Show Toolbar"}
      >
        <FaChevronUp
          // The icon rotates based on the 'isOpen' state
          className={`transition-transform duration-500 ease-in-out 
                     ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>
    </div>
  );
};

export default IconDock;
