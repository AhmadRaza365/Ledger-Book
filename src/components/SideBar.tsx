import { Logout } from "@/lib/Firebase/Services/Auth";
import { FaUserFriends } from "react-icons/fa";
import { FaTruckFast } from "react-icons/fa6";
import { IoHome, IoLogOut } from "react-icons/io5";
import { MdAddBox } from "react-icons/md";
import { Link } from "react-router-dom";

type Props = {
  activePage: string;
};

function SideBar({ activePage }: Props) {
  const pages = [
    {
      name: "Home",
      icon: <IoHome size={20} />,
      link: "/",
    },
    {
      name: "Orders",
      icon: <FaTruckFast size={20} />,
      link: "/orders",
    },
    {
      name: "Add New Order",
      icon: <MdAddBox size={20} />,
      link: "/order/new",
    },
    {
      name: "Users",
      icon: <FaUserFriends size={20} />,
      link: "/users",
    },
  ];

  return (
    <section className="w-full h-screen bg-white sticky top-0 -mt-14 pt-24 pr-4 pl-10 shadow-lg flex flex-col pb-10">
      {pages.map((page, index) => {
        return (
          <Link key={index} to={page.link}>
            <div
              className={` py-2.5 px-4 rounded flex items-center gap-x-2 ${
                activePage === page.name
                  ? "bg-black/10 text-primary"
                  : "bg-white hover:bg-black/5 text-black"
              }`}
            >
              {page.icon}
              {page.name}
            </div>
          </Link>
        );
      })}
      <div
        className={` py-2.5 px-4 rounded flex items-center gap-x-2 bg-white hover:bg-black/5 text-black mt-auto cursor-pointer`}
        onClick={()=>{
          Logout();
        }}
      >
        <IoLogOut size={20} className="rotate-180" />
        Logout
      </div>
    </section>
  );
}

export default SideBar;
