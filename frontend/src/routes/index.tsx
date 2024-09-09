import { useRoutes } from "react-router-dom";
import { Dashboard, ProjectView, ProjectList } from "@/pages"; // Import ProjectList

export const Routes = () => {
  const routes = [
    { path: "/", element: <Dashboard /> },
    { path: "/projects", element: <ProjectList /> },
    { path: "/projects/:project_id", element: <ProjectView /> },
  ];
  return useRoutes(routes);
};