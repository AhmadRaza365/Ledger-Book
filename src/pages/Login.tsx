import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendPasswordReset, loginWithEmailPassword } from "@/lib/Firebase/Services/Auth";
import { useState } from "react";
import toast from "react-hot-toast";

function Login() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const handleLogin = async () => {
    if (email.trim() && password.trim()) {
      try {
        setLoggingIn(true);
        const res = await loginWithEmailPassword(email, password);

        if (res.result === "success") {
          toast.success(res.message);
          // redirect to dashboard
        } else {
          toast.error(res.message);
        }
        setLoggingIn(false);
      } catch (error: any) {
        setLoggingIn(false);
        toast.error(
          error?.message ?? "Something went wrong. Please try again."
        );
      }
    } else {
      toast.error("Email and Password are required");
    }
  };

  const sendResetPasswordEmail = async (email: string) => {
    try {
      setResettingPassword(true);
      const res = await SendPasswordReset(email);
      if (res.result === "success") {
        toast.success(res.message);
        setEmail("");
      } else {
        toast.error(res.message);
      }
      setResettingPassword(false);

    } catch (error: any) {
      setResettingPassword(false);
      toast.error(error?.message ?? "Something went wrong. Please try again.");
    }
  };

  return (
    <section className="col-span-full w-full h-[85vh] flex justify-center items-center">
      <section className="border border-black/10 w-full max-w-sm h-fit rounded-xl shadow-lg py-8 px-6 flex flex-col">
        {!showForgotPassword ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="flex flex-col"
          >
            <h2 className="text-xl font-bold text-center">Login</h2>

            <Input
              className="mt-8"
              type="email"
              placeholder="Email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
              autoComplete="email"
            />
            <Input
              className="mt-4"
              type="password"
              name="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
              autoComplete="current-password"
            />
            <Button
              variant={"link"}
              size={"sm"}
              className="ml-auto"
              onClick={() => {
                setShowForgotPassword(true);
                setEmail("");
                setPassword("");
              }}
              disabled={loggingIn}
              type="button"
            >
              Forgot Password?
            </Button>
            <Button
              variant={"default"}
              className="mt-3"
              disabled={loggingIn}
              type="submit"
            >
              {loggingIn ? "Logging In..." : "Login"}
            </Button>
          </form>
        ) : (
          <>
            <h2 className="text-xl font-bold text-center">Reset Password</h2>

            <Input
              className="mt-8"
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />

            <Button
              variant={"default"}
              className="mt-3"
              disabled={resettingPassword}
              onClick={() => sendResetPasswordEmail(email)}
            >
              Reset Password
            </Button>

            <Button
              variant={"link"}
              size={"sm"}
              className=""
              onClick={() => {
                setShowForgotPassword(false);
                setEmail("");
                setPassword("");
              }}
            >
              Back to Login
            </Button>
          </>
        )}
      </section>
    </section>
  );
}

export default Login;
