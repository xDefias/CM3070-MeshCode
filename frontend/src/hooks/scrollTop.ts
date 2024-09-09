import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// use this to scroll to the top of the page when the route changes
export default function ScrollTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
