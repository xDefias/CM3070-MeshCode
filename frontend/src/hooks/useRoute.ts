import { useLocation, useNavigate } from "react-router-dom";

// This hook is used to get the current route and navigate to another route
export const useRoute = () => {
  const navigate = useNavigate();
  const currentRoute = useLocation().pathname;

  return { currentRoute, navigate };
};
