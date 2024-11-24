import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { GetUserData, Logout } from "@/lib/Firebase/Services/Auth";
import { toast } from "sonner";
import { auth } from "@/lib/Firebase/firebase";
import { CheckIfUserIsFirstUser } from "./lib/Firebase/Services/OnBoard";
import {
  OnBoardState,
  setIsFirstUser,
  setShowOnBoarding,
} from "./redux/slices/onBoardSlice";
import { useDispatch, useSelector } from "react-redux";
import OnBoardingModel from "@/components/models/OnBoardingModel";
import Loader from "./components/Loader";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";

function App() {
  const dispatch = useDispatch();
  const { isFirstUser, showOnBoarding } = useSelector(
    (state: { onBoarding: OnBoardState }) => state.onBoarding
  );

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fetchingUserData, setFetchingUserData] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFetchingUserData(true);
      if (user) {
        GetUserData(user.uid)
          .then((res: any) => {
            console.log(res);
            setIsLoggedIn(true);
            setFetchingUserData(false);
          })
          .catch((error: any) => {
            setIsLoggedIn(false);
            setFetchingUserData(false);
            Logout();
            toast.error(error.message ?? "An error occurred");
          });
      } else {
        setIsLoggedIn(false);
        setFetchingUserData(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const UserOnBoarding = async () => {
    try {
      if (isFirstUser) {
        setLoading(true);
        const checkUsers = await CheckIfUserIsFirstUser();
        if (checkUsers.result === "success") {
          if (checkUsers.data === 0) {
            setLoading(false);
            dispatch(
              setShowOnBoarding({
                showOnBoarding: true,
              })
            );
          } else {
            setLoading(false);
            dispatch(
              setShowOnBoarding({
                showOnBoarding: false,
              })
            );

            dispatch(
              setIsFirstUser({
                isFirstUser: false,
              })
            );
          }
        } else {
          setLoading(false);
          dispatch(
            setShowOnBoarding({
              showOnBoarding: false,
            })
          );
        }
      } else {
        setLoading(false);
        dispatch(
          setShowOnBoarding({
            showOnBoarding: false,
          })
        );
      }
    } catch (error: any) {
      toast.error(error.message ?? "An error occurred");
    }
  };

  useEffect(() => {
    UserOnBoarding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BrowserRouter>
      {!loading ? (
        <>
          <Header isLoggedIn={isLoggedIn} />
          <Routes>
            <Route
              path="/"
              element={
                <DashboardLayout
                  pageName="Customers"
                  children={<Customers />}
                  isLoggedin={isLoggedIn}
                  fetchingUserData={fetchingUserData}
                />
              }
            />

            <Route
              path="/customers"
              element={
                <DashboardLayout
                  pageName="Customers"
                  children={<Customers />}
                  isLoggedin={isLoggedIn}
                  fetchingUserData={fetchingUserData}
                />
              }
            />

            <Route
              path="/customer/:id"
              element={
                <DashboardLayout
                  pageName="Customers"
                  children={<CustomerDetails />}
                  isLoggedin={isLoggedIn}
                  fetchingUserData={fetchingUserData}
                />
              }
            />
          </Routes>

          {showOnBoarding && (
            <OnBoardingModel />
          )}

        </>
      ) : (
        <section className="w-full h-[80vh] flex items-center justify-center">
          <Loader width={50} borderWidth={5} color="primary" />
        </section>
      )}
    </BrowserRouter>
  );
}

export default App;
