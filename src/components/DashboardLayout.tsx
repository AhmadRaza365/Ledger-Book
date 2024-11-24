import React from "react";
import Login from "@/pages/Login";
import Loader from "./Loader";

type Props = {
  children: React.ReactNode;
  pageName: string;
  isLoggedin: boolean;
  fetchingUserData: boolean;
};

export default function DashboardLayout({
  children,
  isLoggedin,
  fetchingUserData,
}: Props) {
  return (
    <section>
      <section className="relative grid grid-cols-11 gap-5">
        {fetchingUserData ? (
          <section className="col-span-full w-full h-[80vh] flex items-center justify-center">
            <Loader width={50} borderWidth={5} color="primary" />
          </section>
        ) : (
          <>
            {isLoggedin && (
              <>
                <section className="col-span-full pt-10 px-5 md:px-10">
                  {children}
                </section>
              </>
            )}
            {!isLoggedin && <Login />}
          </>
        )}
      </section>
    </section>
  );
}
