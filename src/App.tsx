import { useEffect, useState } from "react";
import { Demo } from "@/components/ui/demo";
import { SmokeLogin } from "@/components/ui/smoke-login";

type Page = "home" | "login" | "signup";

export default function App() {
  const [page, setPage] = useState<Page>(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      if (hash === "login") return "login";
      if (hash === "signup" || hash === "sign-up") return "signup";
    }
    return "home";
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      if (hash === "login") setPage("login");
      else if (hash === "signup" || hash === "sign-up") setPage("signup");
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
          await new Promise((r) => setTimeout(r, 1200));
          alert(`Welcome back, ${values.email}!`);
          navigate("home");
        }}
        onProviderSignIn={async (provider) => {
          console.log("Sign in with:", provider);
          await new Promise((r) => setTimeout(r, 1200));
          alert(`Signed in with ${provider}!`);
          navigate("home");
        }}
        footer={
          <p className="text-[12px] text-[var(--muted)]">
            By signing in, you agree to mygit's Terms of Service and Privacy Policy.
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
          await new Promise((r) => setTimeout(r, 1200));
          alert(`Account created for ${values.email}!`);
          navigate("home");
        }}
        onProviderSignIn={async (provider) => {
          console.log("Sign up with:", provider);
          await new Promise((r) => setTimeout(r, 1200));
          alert(`Signed up with ${provider}!`);
          navigate("home");
        }}
        footer={
          <p className="text-[12px] text-[var(--muted)]">
            Free forever for public repositories. No credit card required.
          </p>
        }
      />
    );
  }

  return (
    <Demo
      onLogin={() => navigate("login")}
      onSignUp={() => navigate("signup")}
    />
  );
}
