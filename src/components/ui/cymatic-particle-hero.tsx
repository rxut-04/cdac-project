"use client";

import { useEffect, useRef, useState } from "react";

export interface SliderRevolutionHeroProps {
  /**
   * The embed key of your module in Slider Revolution Anywhere (anywhere.sliderrevolution.com):
   * open the module, click Embed and copy the `ek_…` part. A free account is enough.
   */
  embedKey: string;
  /** Accessible name of the region, read by screen readers. Default: "Animated hero". */
  ariaLabel?: string;
  /** Extra classes for the outer section, for example "overflow-hidden rounded-xl". */
  className?: string;
  /**
   * Classes for the loading placeholder, shown until the module has drawn.
   * Default: "h-svh min-h-[700px]". The module fills the screen and is at least 700 px tall, so the placeholder reserves the same space.
   */
  placeholderClassName?: string;
  /**
   * Interval in milliseconds to automatically morph the cymatic particle form.
   * Default: 2000 (every 2 seconds).
   */
  autoCycleInterval?: number;
}

const join = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

/**
 * An animated full-screen hero for the top of a landing page, made in Slider Revolution Anywhere.
 * Design, words and motion live in your SR Anywhere module: publish it again there and every app
 * that shows this key updates. No slider library in your bundle; the module's script loads async
 * from Slider Revolution's edge.
 */
export function SliderRevolutionHero({
  embedKey,
  ariaLabel = "Animated hero",
  className,
  placeholderClassName = "h-svh min-h-[700px]",
  autoCycleInterval = 2000,
}: SliderRevolutionHeroProps) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el || !embedKey) return;
    setReady(false);
    setFailed(false);
    const script = document.createElement("script");
    script.src = `https://embed.sliderrevolution.com/i/${embedKey}/embed.js`;
    script.async = true;
    script.onerror = () => setFailed(true);
    el.appendChild(script);
    // The module draws itself into the host; the placeholder goes as soon as the host has content or height.
    const checkReady = () => {
      if (
        el.offsetHeight > 0 ||
        el.scrollHeight > 0 ||
        el.querySelector(".sr-anywhere-embed") ||
        el.querySelector("sr7-module")
      ) {
        setReady(true);
      }
    };

    const observer = new ResizeObserver(checkReady);
    observer.observe(el);

    const mutObserver = new MutationObserver(checkReady);
    mutObserver.observe(el, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutObserver.disconnect();
      // Lets the module load again when the user navigates back to this page.
      el.replaceChildren();
      const loaders = (window as unknown as { __sraLoaders?: Record<string, unknown> }).__sraLoaders;
      if (loaders) delete loaders["SR7_" + embedKey.replace(/[^A-Za-z0-9]/g, "") + "_1"];
    };
  }, [embedKey]);

  // Morph through the 10 Cymatic acoustic forms every 2 seconds
  useEffect(() => {
    if (!ready || autoCycleInterval <= 0) return;

    const timer = setInterval(() => {
      try {
        const sr = (window as unknown as { SR7?: any }).SR7;
        if (!sr?.M || !sr?.A?.cymatic?.action) return;

        const modId = Object.keys(sr.M)[0];
        if (!modId) return;

        const mod = sr.M[modId];
        if (!mod.slides) return;

        for (const slideId in mod.slides) {
          const slide = mod.slides[slideId];
          if (!slide?.layers) continue;

          for (const lkey in slide.layers) {
            const layerObj = sr.F.getLayer({ id: modId, skey: slideId, lkey });
            if (layerObj?.c?.addOns?.cymatic) {
              sr.A.cymatic.action(layerObj.c, "cymaticNext");
              return;
            }
          }
        }
      } catch {
        // Ignore until engine finishes mounting
      }
    }, autoCycleInterval);

    return () => clearInterval(timer);
  }, [ready, autoCycleInterval]);

  return (
    <section aria-label={ariaLabel} aria-busy={!ready && !failed} className={join("relative w-full", className)}>
      {!ready && (
        <div
          aria-hidden="true"
          className={join("absolute inset-0 w-full h-full rounded-md bg-muted pointer-events-none", !failed && "animate-pulse", placeholderClassName)}
        />
      )}
      <div ref={host} className="sr-anywhere-embed-host w-full" />
    </section>
  );
}

export default SliderRevolutionHero;
