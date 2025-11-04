import { useState, useRef, useEffect } from "react";
import { UI_ICONS } from "../../utils/icons";

const ResetPositionsFab = ({ onReset, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleResetClick = (scope) => {
    onReset(scope);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="absolute bottom-4 left-4 z-20">
      {isOpen && (
        <div className="absolute bottom-full mb-2 w-48 bg-white rounded-md shadow-md py-1">
          <ul className="list-none p-0 m-0">
            <li
              className="px-4 py-2 text-sm text-[#d43c3c] hover:bg-[#d43c3c]/10"
              onClick={() => handleResetClick("all")}
            >
              Reset All Positions
            </li>
            <li
              className="px-4 py-2 text-sm text-[#d43c3c] hover:bg-[#d43c3c]/10"
              onClick={() => handleResetClick("manual")}
            >
              Reset Manual Positions
            </li>
          </ul>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="p-3 rounded-full shadow-md text-white bg-[#ef4444] hover:bg-[#d43c3c] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rotate-90 hover:rotate-0"
        title="Reset Positions"
      >
        {UI_ICONS.reset_main}
      </button>
    </div>
  );
};

export default ResetPositionsFab;
