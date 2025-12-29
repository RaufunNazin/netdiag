import { useState, useRef, useEffect } from "react";
import { CORE_COLORS_DATA } from "../../utils/constants";

const ColorPicker = ({ selectedColor, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  const handleColorSelect = (color) => {
    onChange(color);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedColorObj = CORE_COLORS_DATA.find(
    (color) => color.hex === selectedColor
  );

  return (
    <div className="relative w-full" ref={pickerRef}>
      <div className="relative flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          // Added dark:bg-neutral-900, dark:border-neutral-700, dark:text-neutral-200
          className="input-style flex items-center justify-between text-left w-full bg-white dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-200"
        >
          <span className="flex items-center">
            <span
              // Added dark:border-neutral-700
              className="w-5 h-5 rounded-full mr-3 border border-neutral-200 dark:border-neutral-700"
              style={{
                backgroundColor: selectedColorObj?.hex || "#FFFFFF",
              }}
            />
            {selectedColorObj?.name || (
              // Added dark:text-neutral-500
              <span className="text-neutral-400 dark:text-neutral-500">
                Select Color
              </span>
            )}
          </span>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            // Added dark:text-neutral-400
            className={`h-4 w-4 text-neutral-500 dark:text-neutral-400 ml-2 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {selectedColor && (
          <button
            type="button"
            onClick={handleClear}
            // Added dark:text-neutral-500 and dark:hover:text-red-400
            className="absolute right-8 text-lg text-neutral-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400 transition-colors"
            title="Clear color"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-md z-20 p-2 grid grid-cols-4 gap-2">
          {CORE_COLORS_DATA.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => handleColorSelect(color.hex)}
              aria-label={color.name}
              // Added dark:hover:border-neutral-500
              className={`py-2 rounded-md text-sm text-center font-semibold hover:opacity-80 transition-opacity border border-transparent hover:border-neutral-300 dark:hover:border-neutral-500 ${color.text}`}
              style={{ backgroundColor: color.hex }}
            >
              {color.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
