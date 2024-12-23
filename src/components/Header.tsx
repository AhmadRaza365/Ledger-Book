import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { IoLogOut } from "react-icons/io5";
import { Logout } from "@/lib/Firebase/Services/Auth";

type props = {
  isLoggedIn: boolean;
};

function Header({ isLoggedIn }: props) {
  useEffect(() => {
    // Set Meta title on component mount
    document.title = import.meta.env.VITE_APP_APP_NAME ?? "Ledger Book";
  }, []);

  return (
    <header className="w-full sticky top-0 left-0 z-30 bg-primary/10 backdrop-blur-md flex justify-between items-center px-10 py-3 shadow-xl">
      <Link
        to="/"
        className="text-black hover:text-primary text-lg font-normal"
      >
        <h1 className="text-xl lg:text-2xl font-bold text-primary">
          {import.meta.env.VITE_APP_APP_NAME}
        </h1>
      </Link>
      <div className="flex items-center justify-end gap-x-2">
        {isLoggedIn ? (
          <div
            className={` py-2.5 px-4 rounded flex items-center gap-x-2 bg-transparent hover:bg-black/5 text-black mt-auto cursor-pointer`}
            onClick={() => {
              Logout();
            }}
          >
            Logout
            <IoLogOut size={20} className="" />
          </div>
        ) : (
          <Link
            to="/"
            className="hidden lg:block text-black hover:text-primary text-lg font-normal ml-5"
          >
            <Button variant={"default"}>Login</Button>
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;
