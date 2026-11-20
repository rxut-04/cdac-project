import { useEffect, useState } from "react";
import DemoOne from "@/components/ui/demo";
import { SmokeLogin } from "@/components/ui/smoke-login";
import { DashboardPage } from "@/components/ui/dashboard-page";

type Page = "home" | "login" | "signup" | "dashboard";

export default function App() {
  const [userEmail, setUserEmail] = useState("alex@mygit.dev");
  const [page, setPage] = useState<Page>(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      if (hash === "login") return "login";
      if (hash === "signup" || hash === "sign-up") return "signup";
      if (hash === "dashboard") return "dashboard";
    }
    return "home";
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      if (hash === "login") setPage("login");
      else if (hash === "signup" || hash === "sign-up") setPage("signup");
      else if (hash === "dashboard") setPage("dashboard");
      else setPage("home");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = (nextPage: Page) => {
    setPage(nextPage);
    if (nextPage === "home") {
      window.history.pushState(null, "", window.location.pathname);
    } else {
      window.location.hash = nextPage;
    }
  };

  if (page === "dashboard") {
    return (
      <DashboardPage
        userEmail={userEmail}
        onSignOut={() => {
          navigate("home");
        }}
      />
    );
  }

  if (page === "login") {
    return (
      <SmokeLogin
        mode="login"
        brand="mygit"
        title="Welcome back"
        subtitle="Sign in to your mygit developer account."
        onSwitchMode={(mode) => navigate(mode)}
        onBackHome={() => navigate("home")}
        onSubmit={async (values) => {
          console.log("Logged in:", values);
          if (values.email) setUserEmail(values.email);
          await new Promise((r) => setTimeout(r, 600));
          navigate("dashboard");
        }}
        onProviderSignIn={async (provider) => {
          console.log("Sign in with:", provider);
          setUserEmail(`alex.${provider}@mygit.dev`);
          await new Promise((r) => setTimeout(r, 600));
          navigate("dashboard");
        }}
        footer={
          <p className="text-[12px] text-neutral-500">
            By signing in, you agree to mygit&apos;s Terms of Service and Privacy Policy.
          </p>
        }
      />
    );
  }

  if (page === "signup") {
    return (
      <SmokeLogin
        mode="signup"
        brand="mygit"
        title="Create an account"
        subtitle="Start building with byte-compatible Git in seconds."
        onSwitchMode={(mode) => navigate(mode)}
        onBackHome={() => navigate("home")}
        onSubmit={async (values) => {
          console.log("Signed up:", values);
          if (values.email) setUserEmail(values.email);
          await new Promise((r) => setTimeout(r, 600));
          navigate("dashboard");
        }}
        onProviderSignIn={async (provider) => {
          console.log("Sign up with:", provider);
          setUserEmail(`alex.${provider}@mygit.dev`);
          await new Promise((r) => setTimeout(r, 600));
          navigate("dashboard");
        }}
        footer={
          <p className="text-[12px] text-neutral-500">
            Free forever for public repositories. No credit card required.
          </p>
        }
      />
    );
  }

  return (
    <DemoOne
      onSignIn={() => navigate("login")}
      onSignUp={() => navigate("signup")}
    />
  );
}
