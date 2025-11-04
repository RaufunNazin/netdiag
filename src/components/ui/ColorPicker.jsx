import { useState, useRef, useEffect } from "react";
import { CORE_COLORS_DATA } from "../../utils/constants";

const ColorPicker = ({ selectedColor, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  const handleColorSelect = (color) => {
    onChange(color);
    setIsOpen(false);
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

  return (
    <div className="relative w-full" ref={pickerRef}>
      <label className="label-style">Cable Color</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input-style flex items-center justify-between text-left"
      >
        <span className="flex items-center">
          <span
            className="w-5 h-5 rounded-full mr-3"
            style={{
              backgroundColor:
                CORE_COLORS_DATA.find((color) => color.hex === selectedColor)
                  ?.hex || "#FFFFFF",
            }}
          />
          {CORE_COLORS_DATA.find((color) => color.hex === selectedColor)
            ?.name || <span className="text-gray-500">Select Cable Color</span>}
        </span>
        <span className="text-slate-500">▼</span>
      </button>
      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-white border border-slate-300 rounded-md shadow-md z-20 p-2 grid grid-cols-4 gap-2">
          {CORE_COLORS_DATA.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => handleColorSelect(color.hex)}
              aria-label={color.name}
              className={`py-2 rounded-md text-sm text-center font-semibold hover:opacity-80 transition-opacity ${color.text}`}
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
