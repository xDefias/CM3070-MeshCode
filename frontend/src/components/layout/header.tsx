import UserSVG from "@/assets/icons/user.svg?react";
import { useRoute } from "@/hooks/useRoute";
import { windowStore } from "@/store";
import { cn } from "@/utils/cn";
import { useState } from "react";
import { useSnapshot } from "valtio";
import { AuthModal } from "../modal/auth-modal";
import { Button } from "../ui/button";
import Sidebar from "./sidebar";
import { useAuth } from "@/contexts/authContext";

export const Header = () => {
  const mainRouter = useRoute();
  const { isLoggedIn, logout } = useAuth(); // Get the isLoggedIn state and logout function from the AuthContext

  const [showAuth, setShowAuth] = useState(false);
  const [activeAuth, setActiveAuth] = useState<"login" | "register">("login");

  const AccountUser = () => {
    return (
      <div className="flex items-center justify-end gap-2 sm:gap-4">
        <button
          className="group flex aspect-square items-center justify-center rounded-full p-1 sm:p-2 border-2 border-terminal hover:bg-terminal"
          onClick={() => mainRouter.navigate("/profile")}
        >
          <UserSVG className="w-4 h-4 sm:w-5 sm:h-5 stroke-terminal group-hover:stroke-white" />
        </button>
        <Button
          variant="leaf"
          size="leaf"
          state="inactive"
          weight="bold"
          font="body-base"
          className="uppercase text-white bg-terminal"
          onClick={logout}
        >
          LOGOUT
        </Button>
      </div>
    );
  };

  const HeaderComponent = () => {
    const windowSnapshot = useSnapshot(windowStore);

    return (
      <nav
        className={cn(
          "pointer-events-auto z-50 flex w-full place-content-between items-center px-4 gap-1 sm:gap-2 transition-all ease-in-out md:px-24 lg:px-32",
          windowSnapshot.menuActive
            ? "md:w-[calc(100%-200px)]"
            : "md:w-[calc(100%-80px)]"
        )}
      >
        <button
          className="cursor-pointer"
          onClick={() => mainRouter.navigate("/")}
        >
          {/* <img
            src="/logo.png"
            alt="bang logo"
            className="h-full w-20 md:w-24 xl:w-32"
          /> */}
          <div className="text-white text-xl md:text-2xl xl:text-3xl font-bold">
            MeshCode
          </div>
        </button>
        {isLoggedIn ? (
          <AccountUser />
        ) : (
          <AuthModal
            open={showAuth}
            onOpenChange={(open: boolean) => setShowAuth(open)}
            onVariantChange={(variant: "login" | "register") =>
              setActiveAuth(variant)
            }
            close={() => setShowAuth(false)}
            variant={activeAuth}
          >
            <div className="flex gap-x-2 md:gap-x-4">
              <Button
                id="login"
                variant="leaf"
                size="leaf"
                state="active"
                weight="bold"
                font="body-base"
                className="uppercase text-white bg-terminal"
                onClick={() => setActiveAuth("login")}
              >
                LOGIN
              </Button>
              <Button
                id="register"
                variant="leaf"
                size="leaf"
                state="inactive"
                weight="bold"
                font="body-base"
                className="uppercase text-white bg-terminal"
                onClick={() => setActiveAuth("register")}
              >
                REGISTER
              </Button>
            </div>
          </AuthModal>
        )}
      </nav>
    );
  };

  return (
    <div className="fixed z-50 ml-auto flex h-full max-h-24 w-full flex-row place-content-between items-center bg-black">
      {isLoggedIn && <Sidebar />}
      <HeaderComponent />
    </div>
  );
};
