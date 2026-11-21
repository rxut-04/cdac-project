import { useEffect, useState } from "react";
import { AuthenticateWithRedirectCallback, useUser, useClerk } from "@clerk/react";
import DemoOne from "@/components/ui/demo";
import { SmokeLogin } from "@/components/ui/smoke-login";
import { DashboardPage } from "@/components/ui/dashboard-page";

type Page = "home" | "login" | "signup" | "dashboard";

export default function App() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();
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

  // Check for SSO Callback from OAuth providers
  const isSSOCallback =
    typeof window !== "undefined" &&
    (window.location.pathname === "/sso-callback" ||
      window.location.hash.includes("sso-callback") ||
      window.location.search.includes("__clerk"));

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

  // Sync user email when Clerk signs in
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const primaryEmail = user.primaryEmailAddress?.emailAddress;
      if (primaryEmail) {
        setUserEmail(primaryEmail);
      }
    }
  }, [isLoaded, isSignedIn, user]);

  const navigate = (nextPage: Page) => {
    setPage(nextPage);
    if (nextPage === "home") {
      window.history.pushState(null, "", window.location.pathname);
    } else {
      window.location.hash = nextPage;
    }
  };

  // Render SSO redirect callback handler if active
  if (isSSOCallback) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0c0d0c] text-white">
        <div className="flex flex-col items-center gap-4 text-center p-6">
          <div className="size-8 rounded-full border-2 border-[#9dff3a] border-t-transparent animate-spin" />
          <p className="text-sm font-medium tracking-wide text-neutral-400">
            Completing authentication with Clerk...
          </p>
          <AuthenticateWithRedirectCallback
            signInForceRedirectUrl="/#dashboard"
            signUpForceRedirectUrl="/#dashboard"
          />
        </div>
      </div>
    );
  }

  if (page === "dashboard") {
    const currentEmail = (isSignedIn && user?.primaryEmailAddress?.emailAddress) || userEmail;
    return (
      <DashboardPage
        userEmail={currentEmail}
        onSignOut={async () => {
          if (isSignedIn) {
            try {
              await signOut();
            } catch (err) {
              console.error("Sign out error:", err);
            }
          }
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
          if (values.email) setUserEmail(values.email);
          navigate("dashboard");
        }}
        onProviderSignIn={async (provider) => {
          setUserEmail(`alex.${provider}@mygit.dev`);
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
          if (values.email) setUserEmail(values.email);
          navigate("dashboard");
        }}
        onProviderSignIn={async (provider) => {
          setUserEmail(`alex.${provider}@mygit.dev`);
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
      onDashboard={() => navigate("dashboard")}
    />
  );
}
