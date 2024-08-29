import React from "react";
import SideBar from "./SideBar";
import Login from "@/pages/Login";
import Loader from "./Loader";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

type Props = {
  children: React.ReactNode;
  pageName: string;
  isLoggedin: boolean;
  fetchingUserData: boolean;
};

export default function DashboardLayout({
  children,
  pageName,
  isLoggedin,
  fetchingUserData,
}: Props) {
  return (
    <section >
      <section className="relative hidden lg:grid grid-cols-11 gap-5">
        {fetchingUserData ? (
          <section className="col-span-full w-full h-[80vh] flex items-center justify-center">
            <Loader width={50} borderWidth={5} color="primary" />
          </section>
        ) : (
          <>
            {isLoggedin && (
              <>
                <section className="col-span-2">
                  <SideBar activePage={pageName} />
                </section>
                <section className="col-span-9 pt-10 pr-10">{children}</section>
              </>
            )}
            {!isLoggedin && <Login />}
          </>
        )}
      </section>
      <section className="w-full h-[80vh] flex lg:hidden flex-col items-center justify-center gap-2">
        <p className="text-base text-center">
          Please use a desktop or laptop to view this page.
        </p>
        <p className="text-base text-center">
          Want to Track Order?
        </p>
        <Link
          to="/track-order"
          className="text-black hover:text-primary text-lg font-normal ml-5"
        >
          <Button variant={"default"} >
            Track Order
          </Button>
        </Link>
      </section>
    </section>
  );
}
