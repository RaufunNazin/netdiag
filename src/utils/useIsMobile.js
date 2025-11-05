import { useState, useEffect } from "react";

export const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(() => {
    try {
      return window.innerWidth <= breakpoint;
    } catch (e) {
      console.log(e);
      return false;
    }
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
};
