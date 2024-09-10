import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
// import { Button } from "./ui/button";

type props = {
  isLoggedIn: boolean;
}

function Header({ isLoggedIn }: props) {
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
      <div className="hidden lg:flex items-center justify-end gap-x-2">
        {isLoggedIn ? (
          <Link
            to="/"
            className="hidden lg:block text-black hover:text-primary text-lg font-normal ml-5"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            to="/"
            className="hidden lg:block text-black hover:text-primary text-lg font-normal ml-5"
          >
            <Button variant={"default"} >
              Login
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;