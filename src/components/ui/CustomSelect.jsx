import { useState, useRef, useEffect } from "react";

const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation(); // Prevent opening the dropdown
    onChange({ target: { value: "" } }); // Send empty value to parent
  };

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

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`input-style flex items-center justify-between text-left w-full ${
            disabled
              ? "opacity-50 cursor-not-allowed bg-slate-100"
              : "bg-white cursor-pointer"
          }`}
        >
          <span
            className={`block truncate mr-6 ${
              !value ? "text-slate-400" : "text-slate-800"
            }`}
          >
            {value || placeholder}
          </span>

          {/* Chevron Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-slate-500 ml-2 transition-transform duration-200 ${
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

        {/* Clear Button - Only shows if a value is selected and not disabled */}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-8 text-slate-400 hover:text-red-500 transition-colors z-10"
            title="Clear selection"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white border border-slate-300 p-1 text-base shadow-lg focus:outline-none sm:text-sm">
          {options.length === 0 ? (
            <div className="relative cursor-default select-none py-2 px-4 text-slate-500 italic">
              No options
            </div>
          ) : (
            options.map((option, index) => {
              const optionValue =
                typeof option === "object" ? option.value : option;
              const optionLabel =
                typeof option === "object" ? option.label : option;

              // Skip rendering if value is empty/null
              if (
                optionValue === "" ||
                optionValue === null ||
                optionValue === undefined
              ) {
                return null;
              }

              const isSelected = String(value) === String(optionValue);

              return (
                <div
                  key={index}
                  onClick={() => handleSelect(optionValue)}
                  className={`relative cursor-pointer select-none rounded py-2 pl-3 pr-9 hover:bg-blue-50 transition-colors ${
                    isSelected
                      ? "font-semibold text-blue-600 bg-blue-50"
                      : "text-slate-900"
                  }`}
                >
                  <span className="block truncate">{optionLabel}</span>

                  {isSelected && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
