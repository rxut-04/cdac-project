import { SliderRevolutionHero } from "@/components/ui/cymatic-particle-hero";

// The demo key plays "Cymatic": a 3D particle sculpture that morphs between ten forms on its own.
// It runs on Slider Revolution's demo account; make your own module with a free SR Anywhere account
// (anywhere.sliderrevolution.com/platforms/ai-builders) and pass its key instead.
export function Demo() {
  return (
    <div className="w-full bg-background">
      <SliderRevolutionHero embedKey="ek_biqgfhte6l7dhaya3qyw" />
    </div>
  );
}

export default Demo;
