import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import DashboardLayout from "@/components/DashboardLayout";
// import Orders from "./pages/Orders";
// import CreateOrder from "./pages/CreateOrder";
// import OrderDetails from "./pages/OrderDetails";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { GetUserData, Logout } from "@/lib/Firebase/Services/Auth";
import { toast } from "sonner";
// import Users from "./pages/Users";
import { UserType } from "@/types/UserType";
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

function App() {
  const dispatch = useDispatch();
  const { isFirstUser, showOnBoarding } = useSelector(
    (state: { onBoarding: OnBoardState }) => state.onBoarding
  );

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fetchingUserData, setFetchingUserData] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  console.log(user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFetchingUserData(true);
      if (user) {
        GetUserData(user.uid)
          .then((res: any) => {
            setIsLoggedIn(true);
            setFetchingUserData(false);
            setUser(res.userData);
          })
          .catch((error: any) => {
            setUser(null);
            setIsLoggedIn(false);
            setFetchingUserData(false);
            Logout();
            toast.error(error.message ?? "An error occurred");
          });
      } else {
        setUser(null);
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
                  pageName="Home"
                  children={<Home />}
                  isLoggedin={isLoggedIn}
                  fetchingUserData={fetchingUserData}
                />
              }
            />
            <Route
              path="/orders"
              element={
                <DashboardLayout
                  pageName="Orders"
                  // children={<Orders />}
                  children={<h1>Orders</h1>}
                  isLoggedin={isLoggedIn}
                  fetchingUserData={fetchingUserData}
                />
              }
            />
            <Route
              path="/order/new"
              element={
                <DashboardLayout
                  pageName="Add New Order"
                  // children={<CreateOrder />}
                  children={<h1>Create Order</h1>}
                  isLoggedin={isLoggedIn}
                  fetchingUserData={fetchingUserData}
                />
              }
            />

            <Route
              path="/users"
              element={
                <DashboardLayout
                  pageName="Users"
                  // children={<Users />}
                  children={<h1>Users</h1>}
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
