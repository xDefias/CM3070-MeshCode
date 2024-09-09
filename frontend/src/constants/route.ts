import HomeSVG from "@/assets/icons/home.svg?react";
import FolderSVG from "@/assets/icons/folder.svg?react";

export const ROUTE_LIST = {
  DESKTOP: [
    {
      name: "Home",
      slug: "home",
      route: "/",
      icon: HomeSVG
    },
    {
      name: "Project",
      slug: "project",
      route: "/projects",
      icon: FolderSVG
    },
  ]
};
