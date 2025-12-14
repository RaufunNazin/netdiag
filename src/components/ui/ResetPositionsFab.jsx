import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { UI_ICONS } from "../../utils/icons";

const ResetPositionsFab = ({ onReset, disabled, className = "" }) => {
  // ... (keep existing state and useEffect) ...
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      const menuElement = document.getElementById("reset-positions-menu");

      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        menuElement &&
        !menuElement.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [buttonRef]);

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.top,
        left: rect.right + 12,
      });
    }
    setIsOpen(!isOpen);
  };

  const handleResetClick = (scope) => {
    onReset(scope);
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        disabled={disabled}
        // Added 'reset-fab-btn' class
        className={`reset-fab-btn p-3 rounded-full text-white bg-[#ef4444] hover:bg-[#d43c3c] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${className}`}
        title="Reset Positions [R]"
      >
        {/* Fixed size wrapper + icon class */}
        <div className="w-4 h-4 flex items-center justify-center icon-reset">
          {UI_ICONS.reset_main}
        </div>
      </button>
      {/* ... (keep portal code) ... */}
      {isOpen &&
        createPortal(
          <div
            id="reset-positions-menu"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
            }}
            className="fixed z-[9999] w-48 bg-white rounded-md shadow-xl border border-slate-100 py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-left"
          >
            <ul className="list-none p-0 m-0">
              <li
                className="px-4 py-2 text-sm text-[#d43c3c] hover:bg-[#d43c3c]/10 cursor-pointer transition-colors"
                onClick={() => handleResetClick("all")}
              >
                Reset All Positions
              </li>
              <li
                className="px-4 py-2 text-sm text-[#d43c3c] hover:bg-[#d43c3c]/10 cursor-pointer transition-colors"
                onClick={() => handleResetClick("manual")}
              >
                Reset Manual Positions
              </li>
            </ul>
          </div>,
          document.body
        )}
    </>
  );
};

export default ResetPositionsFab;
