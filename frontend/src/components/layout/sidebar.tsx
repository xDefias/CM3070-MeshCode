import MenuHamburgerSVG from "@/assets/icons/menu-hamburger.svg?react";
import Typography from "@/components/ui/typography";
import { ROUTE_LIST } from "@/constants/route";
import { useRoute } from "@/hooks/useRoute";
import { windowStore } from "@/store";
import { cn } from "@/utils/cn";
import { useSnapshot } from "valtio";

export const Sidebar = () => {
  const mainRouter = useRoute();
  const windowSnapshot = useSnapshot(windowStore);

  return (
    <div className="relative hidden h-full bg-terminal px-4 py-8 md:flex md:px-4">
      <div className="flex">
        <button
          onClick={() => {
            windowStore.menuActive = !windowSnapshot.menuActive;
          }}
          className="z-50 px-0 md:px-2"
        >
          <MenuHamburgerSVG className="size-7 stroke-white" />
        </button>
        <nav
          className={cn(
            "fixed left-0 top-0 hidden h-full space-y-8 border-r border-terminal/20 bg-black py-8 pt-24 text-white md:block",
            windowSnapshot.menuActive ? "md:w-[200px]" : "md:w-[80px]"
          )}
        >
          <ul
            className={cn(
              "mx-auto flex max-h-[70dvh] flex-col space-y-8 overflow-y-scroll pl-7",
              windowSnapshot.menuActive && "items-start"
            )}
          >
            {ROUTE_LIST.DESKTOP.map((item) => (
              <Typography
                key={item.name}
                element="li"
                variant="body-base"
                type="tertiary"
                weight="normal"
              >
                <button
                  onClick={() => {
                    mainRouter.navigate(item.route);
                  }}
                  className={cn(
                    "flex items-center gap-4 text-white",
                    mainRouter.currentRoute === item.route && "text-terminal"
                  )}
                >
                  <span
                    className={cn(
                      "[&>svg]:size-5",
                      mainRouter.currentRoute === item.route && "stroke-terminal"
                    )}
                  >
                    {item.icon({})}
                  </span>
                  <Typography
                    element="span"
                    variant="body-sm"
                    type="tertiary"
                    className={cn(
                      "whitespace-nowrap",
                      windowSnapshot.menuActive ? "block" : "hidden"
                    )}
                  >
                    {item.name}
                  </Typography>
                </button>
              </Typography>
            ))}
          </ul>
          <div
            style={{ marginTop: "15px" }}
            className="mt-1 border-y border-white mx-6 my-6 border-b-0"
          ></div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
