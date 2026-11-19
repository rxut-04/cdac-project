import { SliderRevolutionHero } from "@/components/ui/cymatic-particle-hero";

interface DemoProps {
  onLogin?: () => void;
  onSignUp?: () => void;
  onDashboard?: () => void;
}

export function Demo({ onLogin, onSignUp, onDashboard }: DemoProps) {
  return (
    <div className="w-full bg-background min-h-screen">
      <SliderRevolutionHero
        embedKey="ek_biqgfhte6l7dhaya3qyw"
        loginText="Login"
        signUpText="Sign Up"
        dashboardText="Dashboard"
        onLogin={onLogin}
        onSignUp={onSignUp}
        onDashboard={onDashboard}
        brandText="MYGIT"
        headlineLine1="Personal."
        headlineLine2="GitHub."
        paragraphText="A private, byte-compatible Git workspace. Host repos, manage pull requests, track issues, and push code in seconds."
        actionHintText="Push to deploy. Resonate with every commit."
        taglineText="PERSONAL GIT. UNLIMITED REPOS."
        formLabels={{
          Bloom: "Commits",
          Halo: "Branches",
          Shell: "Terminal",
          Fold: "Pulls",
          Cube: "Issues",
          Pillar: "Reviews",
          Möbius: "Actions",
          Orbits: "Releases",
          Crystal: "SSH Keys",
          Core: "Repositories",
        }}
      />
    </div>
  );
}

export default Demo;
