import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
import Loader from "../Loader";
import toast from "react-hot-toast";
import { registerNewUser } from "@/lib/Firebase/Services/Auth";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { setIsFirstUser, setShowOnBoarding } from "@/redux/slices/onBoardSlice";

function OnBoardingModel() {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const registerUser = async () => {
    try {
      if (
        name.trim() !== "" &&
        email.trim() !== "" &&
        password.trim() !== "" &&
        confirmPassword.trim() !== "" &&
        phone.trim() !== "" &&
        password === confirmPassword
      ) {
        setLoading(true);

        const res = await registerNewUser(name, email, password, phone, false);

        if (res.result === "success") {
          toast.success("User registered successfully");
          setLoading(false);
          dispatch(
            setIsFirstUser({
              isFirstUser: false,
            })
          );
          dispatch(
            setShowOnBoarding({
              showOnBoarding: false,
            })
          );
        } else {
          toast.error(res.message);
        }
      } else {
        if (!name.trim()) {
          toast.error("Name is required");
        }

        if (!email.trim()) {
          toast.error("Email is required");
        }

        if (!password.trim()) {
          toast.error("Password is required");
        }

        if (!confirmPassword.trim()) {
          toast.error("Confirm Password is required");
        }

        if (!phone.trim()) {
          toast.error("Phone is required");
        }

        if (
          password.trim() &&
          confirmPassword.trim() &&
          password !== confirmPassword
        ) {
          toast.error("Passwords do not match");
        }
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message ?? "An error occurred");
    }
  };

  return (
    <section className="fixed top-0 left-0 w-full h-full bg-black/30 z-50 backdrop-blur-sm flex items-center justify-center">
      <form
        className="w-full max-w-lg h-fit px-6 py-6 bg-white rounded-xl shadow-xl slideUpFadeInAnimation"
        onSubmit={(e) => {
          e.preventDefault();
          registerUser();
        }}
      >
        <h1 className="text-2xl font-bold text-center">
          Welcome to the System
        </h1>
        <p className="text-center text-lg mt-1">
          Create a new user to get started
        </p>

        <section className="flex flex-col gap-4 mt-8">
          <Label htmlFor="name" className="flex flex-col gap-1.5">
            Name
            <Input
              type="text"
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Label>
          <Label htmlFor="email" className="flex flex-col gap-1.5">
            Email
            <Input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Label>
          <Label htmlFor="phone" className="flex flex-col gap-1.5">
            Phone
            <Input
              type="tel"
              id="phone"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </Label>

          <Label htmlFor="password" className="flex flex-col gap-1.5">
            Password
            <div className="relative flex items-center">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="w-fit h-fit absolute right-5"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
              </button>
            </div>
          </Label>

          <Label htmlFor="confirmPassword" className="flex flex-col gap-1.5">
            Confirm Password
            <div className="relative flex items-center">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="w-fit h-fit absolute right-5"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <IoEyeOff size={20} />
                ) : (
                  <IoEye size={20} />
                )}
              </button>
            </div>
          </Label>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader width={20} borderWidth={2} color="secondary" />
            ) : (
              "Register"
            )}
          </Button>
        </section>
      </form>
    </section>
  );
}

export default OnBoardingModel;
