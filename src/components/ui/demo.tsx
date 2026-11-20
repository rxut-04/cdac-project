// This is a file with a demo for your component
// That's what users will see in the preview
// Create new files in this directory to add more demos

import FigmaBrandHero from "@/components/ui/figma-brand-hero";

// ONLY DEFAULT EXPORT WILL BE TREATED AS A DEMO
export default function DemoOne() {
  return (
    <main className="min-h-screen w-full bg-[#ECECEC] dark:bg-[#05070E] transition-colors duration-500 flex items-center justify-center p-4 sm:p-8">
      <FigmaBrandHero />
      {/* <ChaosMatrixText /> */}
      {/* <SteppedRibbonText /> */}
      {/* <ScribbleCycleStack /> */}
      {/* <EditorialMediaText /> */}
    </main>
  );
}
