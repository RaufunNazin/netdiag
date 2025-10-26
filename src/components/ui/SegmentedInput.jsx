import React from "react";
import { useState, useRef, useEffect } from "react";
import MISC from "../../utils/misc";

const SegmentedInput = ({
  count,
  maxLength,
  separator,
  value = "",
  onChange,
  inputMode = "text",
}) => {
  const [segments, setSegments] = useState(Array(count).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    const valueSegments = value.split(separator);
    const newSegments = Array.from({ length: count }, (_, i) => valueSegments[i] || "");
    setSegments(newSegments);
  }, [value, count, separator]);

  const handleChange = (e, index) => {
    const inputValue = e.target.value;
    const newSegments = [...segments];

    let sanitizedValue = inputValue;
    if (inputMode === MISC.NUMERIC) {
      sanitizedValue = sanitizedValue.replace(/[^0-9]/g, "");
    } else {
      sanitizedValue = sanitizedValue.replace(/[^a-zA-Z0-9]/g, "");
    }
    
    newSegments[index] = sanitizedValue.slice(0, maxLength);
    setSegments(newSegments);

    onChange(newSegments.join(separator));

    if (sanitizedValue.length >= maxLength && index < count - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && segments[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e, index) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedSegments = pastedData.split(separator);
    const newSegments = [...segments];

    let currentSegment = index;
    for (let i = 0; i < pastedSegments.length && currentSegment < count; i++) {
        newSegments[currentSegment] = pastedSegments[i].slice(0, maxLength);
        currentSegment++;
    }

    setSegments(newSegments);
    onChange(newSegments.join(separator));
  }

  return (
    <div className="flex items-center gap-1">
      {segments.map((segment, index) => (
        <React.Fragment key={index}>
          <input
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode={inputMode}
            value={segment}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={(e) => handlePaste(e, index)}
            className="input-style w-full text-center p-2"
            maxLength={maxLength}
          />
          {index < count - 1 && (
            <span className="text-slate-400 font-bold">{separator}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default SegmentedInput;