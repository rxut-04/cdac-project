"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
  /** Handler for the Login button */
  onLogin?: () => void;
  /** Handler for the Sign Up button */
  onSignUp?: () => void;
  /** Handler for the direct Dashboard button */
  onDashboard?: () => void;
  /** Custom label for Login button. Default: "Login" */
  loginText?: string;
  /** Custom label for Sign Up button. Default: "Sign Up" */
  signUpText?: string;
  /** Custom label for Dashboard button. Default: "Dashboard" */
  dashboardText?: string;

  // Personal GitHub Content Customizations
  brandText?: string;
  headlineLine1?: string;
  headlineLine2?: string;
  paragraphText?: string;
  actionHintText?: string;
  taglineText?: string;
  formLabels?: Record<string, string>;
}

const join = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

interface HeroButtonsProps {
  isDark: boolean;
  onLogin?: () => void;
  onSignUp?: () => void;
  onDashboard?: () => void;
  loginText?: string;
  signUpText?: string;
  dashboardText?: string;
  className?: string;
}

export function HeroButtons({
  isDark,
  onLogin,
  onSignUp,
  onDashboard,
  loginText = "Login",
  signUpText = "Sign Up",
  dashboardText = "Dashboard",
  className,
}: HeroButtonsProps) {
  return (
    <div
      className={join(
        "flex flex-col gap-2.5 transition-colors duration-300 pointer-events-auto",
        className
      )}
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* Sign Up (Primary CTA) */}
        <button
          type="button"
          onClick={onSignUp}
          className={join(
            "group inline-flex items-center justify-center gap-2 h-9 md:h-10 px-5 md:px-6 rounded-full text-xs md:text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer select-none active:scale-95 shadow-sm",
            isDark
              ? "bg-[#ebede4] text-[#141a16] border border-[#ebede4] hover:bg-white hover:border-white hover:shadow-md hover:shadow-[#ebede4]/20"
              : "bg-[#303b35] text-[#ebede4] border border-[#303b35] hover:bg-[#1a211e] hover:border-[#1a211e] hover:shadow-md hover:shadow-[#303b35]/25"
          )}
        >
          <span>{signUpText}</span>
          <svg
            className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3.5 8h9M8.5 4l4 4-4 4" />
          </svg>
        </button>

        {/* Login (Outlined Pill matching hero controls) */}
        <button
          type="button"
          onClick={onLogin}
          className={join(
            "inline-flex items-center justify-center gap-2 h-9 md:h-10 px-5 md:px-6 rounded-full text-xs md:text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer select-none active:scale-95 backdrop-blur-sm",
            isDark
              ? "border border-[#7f8c80]/60 text-[#ebede4] hover:border-[#ebede4] hover:bg-[#ebede4]/10"
              : "border border-[#7f8c80]/60 text-[#303b35] hover:border-[#303b35] hover:bg-[#303b35]/8"
          )}
        >
          <span>{loginText}</span>
        </button>

        {/* Explore Dashboard (Direct access) */}
        {onDashboard && (
          <button
            type="button"
            onClick={onDashboard}
            className={join(
              "inline-flex items-center justify-center gap-1.5 h-9 md:h-10 px-4 rounded-full text-xs md:text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer select-none active:scale-95 backdrop-blur-sm border",
              isDark
                ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-500/50"
                : "border-emerald-600/30 text-emerald-700 bg-emerald-600/10 hover:bg-emerald-600/20 hover:border-emerald-600/50"
            )}
            title="Open personal dashboard"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
            <span>{dashboardText}</span>
          </button>
        )}
      </div>

      {/* Personal GitHub instance indicator */}
      <div
        className={join(
          "inline-flex items-center gap-2 text-[11px] font-mono tracking-tight transition-colors select-none",
          isDark ? "text-[#ebede4]/65" : "text-[#303b35]/70"
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Personal GitHub</span>
        <span>•</span>
        <span className="opacity-80">@rxut-04</span>
        <span>•</span>
        <span className="opacity-80">v2.4 Git Core</span>
      </div>
    </div>
  );
}

function replaceTextInNode(node: Node, target: string, replacement: string) {
  if (node.nodeType === Node.TEXT_NODE) {
    if (node.nodeValue && node.nodeValue.includes(target)) {
      node.nodeValue = node.nodeValue.replaceAll(target, replacement);
    }
  } else {
    for (let i = 0; i < node.childNodes.length; i++) {
      replaceTextInNode(node.childNodes[i], target, replacement);
    }
  }
}

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
  onLogin,
  onSignUp,
  onDashboard,
  loginText = "Login",
  signUpText = "Sign Up",
  dashboardText = "Dashboard",
  brandText = "MYGIT",
  headlineLine1 = "Personal.",
  headlineLine2 = "GitHub.",
  paragraphText = "A high-performance personal Git server & developer workspace. Host repositories, manage pull requests, track issues, and push code from terminal in seconds.",
  actionHintText = "Push to deploy. Resonate with every commit.",
  taglineText = "PERSONAL GIT. UNLIMITED REPOS.",
  formLabels = {
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
  },
}: SliderRevolutionHeroProps) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ctaMount, setCtaMount] = useState<HTMLElement | null>(null);
  const [isDark, setIsDark] = useState(false);

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

  // Adjust hero content dynamically for Personal GitHub
  useEffect(() => {
    if (!ready || !host.current) return;

    const root = host.current;

    const applyReplacements = () => {
      // 1. Logo / Brand
      const logoLayers = root.querySelectorAll<HTMLElement>(
        "sr7-layer[data-alias='logo'], sr7-layer[data-id='6']"
      );
      logoLayers.forEach((el) => {
        if (el.textContent && el.textContent.includes("CYMATIC")) {
          replaceTextInNode(el, "CYMATIC", brandText);
        }
      });

      // 2. Headline Line 1: Soundless -> headlineLine1 (default "Personal.")
      const soundlessLayers = root.querySelectorAll<HTMLElement>(
        "sr7-layer[data-alias='Soundless'], sr7-layer[data-id='40']"
      );
      soundlessLayers.forEach((el) => {
        if (el.textContent && el.textContent.includes("Soundless")) {
          replaceTextInNode(el, "Soundless.", headlineLine1);
          replaceTextInNode(el, "Soundless", headlineLine1);
        }
      });

      // 3. Headline Line 2: Alive. -> headlineLine2 (default "GitHub.")
      const aliveLayers = root.querySelectorAll<HTMLElement>(
        "sr7-layer[data-alias*='Alive'], sr7-layer[data-id='7']"
      );
      aliveLayers.forEach((el) => {
        if (el.textContent && el.textContent.includes("Alive")) {
          replaceTextInNode(el, "Alive.", headlineLine2);
          replaceTextInNode(el, "Alive", headlineLine2);
        }
      });

      // Also ensure all H1 headers are updated
      const h1List = root.querySelectorAll<HTMLElement>("h1");
      h1List.forEach((h1) => {
        if (h1.textContent?.includes("Soundless")) {
          replaceTextInNode(h1, "Soundless.", headlineLine1);
          replaceTextInNode(h1, "Soundless", headlineLine1);
        }
        if (h1.textContent?.includes("Alive")) {
          replaceTextInNode(h1, "Alive.", headlineLine2);
          replaceTextInNode(h1, "Alive", headlineLine2);
        }
      });

      // 4. Paragraph
      const pLayers = root.querySelectorAll<HTMLElement>(
        "sr7-layer[data-alias='paragraph'], sr7-layer[data-id='9'], p"
      );
      pLayers.forEach((el) => {
        if (
          el.textContent &&
          (el.textContent.includes("thousand small") ||
            el.textContent.includes("living sculpture") ||
            el.textContent.includes("A thousand"))
        ) {
          el.textContent = paragraphText;
        }
      });

      // 5. Left action hint
      const hintLayers = root.querySelectorAll<HTMLElement>(
        "sr7-layer[data-alias*='Move to shape'], sr7-layer[data-id='10']"
      );
      hintLayers.forEach((el) => {
        if (el.textContent && el.textContent.includes("Move to shape")) {
          replaceTextInNode(el, "Move to shape. Press to resonate.", actionHintText);
          replaceTextInNode(el, "Move to shape.", actionHintText);
        }
      });

      // 6. Right tagline
      const taglineLayers = root.querySelectorAll<HTMLElement>(
        "sr7-layer[data-alias*='TEN FORMS'], sr7-layer[data-id='11']"
      );
      taglineLayers.forEach((el) => {
        if (el.textContent && el.textContent.includes("TEN FORMS")) {
          replaceTextInNode(el, "TEN FORMS. ENDLESS EXPRESSION.", taglineText);
          replaceTextInNode(el, "TEN FORMS", taglineText);
        }
      });

      // 7. Right 10 Form navigation buttons
      if (formLabels) {
        Object.entries(formLabels).forEach(([original, custom]) => {
          const formLayers = root.querySelectorAll<HTMLElement>(
            `sr7-layer[data-alias='${original}']`
          );
          formLayers.forEach((el) => {
            if (el.textContent && el.textContent.includes(original)) {
              replaceTextInNode(el, original, custom);
            }
          });
        });
      }
    };

    applyReplacements();

    const observer = new MutationObserver(() => {
      applyReplacements();
    });
    observer.observe(root, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, [
    ready,
    brandText,
    headlineLine1,
    headlineLine2,
    paragraphText,
    actionHintText,
    taglineText,
    formLabels,
  ]);

  // Detect and track Light/Dark theme changes from the hero's theme toggle
  useEffect(() => {
    if (!ready || !host.current) return;

    const updateThemeState = () => {
      const aliveEl = host.current?.querySelector(
        "h1, [data-alias*='Alive'], [data-alias*='GitHub'], sr7-layer[data-id='7']"
      );
      if (aliveEl) {
        const col = window.getComputedStyle(aliveEl).color;
        const match = col.match(/\d+/g);
        if (match && match.length >= 3) {
          const [r, g, b] = match.map(Number);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          setIsDark(brightness > 130);
        }
      }
    };

    updateThemeState();

    const observer = new MutationObserver(updateThemeState);
    observer.observe(host.current, { attributes: true, subtree: true, attributeFilter: ["style", "class"] });

    const themeBtn = host.current.querySelector(
      "[data-alias*='Switch'], [data-alias*='Dark'], [data-alias*='Light'], sr7-layer[data-id='33']"
    );
    if (themeBtn) {
      themeBtn.addEventListener("click", () => setTimeout(updateThemeState, 80));
    }

    return () => observer.disconnect();
  }, [ready]);

  // Anchor the CTA buttons container directly after the headline group
  useEffect(() => {
    if (!ready || !host.current) return;

    let mountedContainer: HTMLElement | null = null;

    const attachMount = () => {
      if (!host.current || mountedContainer) return;

      const root = host.current;
      const headlineGroup = root.querySelector<HTMLElement>(
        "sr7-grp[data-id='37'], [data-alias='headline text group']"
      );

      const h1List = Array.from(root.querySelectorAll<HTMLElement>("h1"));
      const aliveH1 =
        h1List.find((el) => {
          const t = el.textContent?.toLowerCase() || "";
          return (
            t.includes("github") ||
            t.includes("alive") ||
            t.includes("personal") ||
            t.includes("soundless")
          );
        }) || h1List[h1List.length - 1];

      let parentTarget: HTMLElement | null = null;
      let insertAfter: HTMLElement | null = null;

      if (headlineGroup) {
        parentTarget = headlineGroup;
      } else if (aliveH1) {
        const layer = aliveH1.closest<HTMLElement>("sr7-layer") || aliveH1;
        parentTarget = layer.parentElement;
        insertAfter = layer;
      }

      if (parentTarget) {
        let container = parentTarget.querySelector<HTMLElement>("#sr-hero-cta-group");
        if (!container) {
          container = document.createElement("div");
          container.id = "sr-hero-cta-group";
          container.style.cssText =
            "display: flex; align-items: center; gap: 12px; margin-top: 24px; position: relative; z-index: 50; pointer-events: auto; clear: both;";
          if (insertAfter && insertAfter.nextSibling) {
            parentTarget.insertBefore(container, insertAfter.nextSibling);
          } else {
            parentTarget.appendChild(container);
          }
        }
        mountedContainer = container;
        setCtaMount(container);
      }
    };

    attachMount();

    const observer = new MutationObserver(() => {
      if (!mountedContainer) attachMount();
    });
    observer.observe(host.current, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (mountedContainer && mountedContainer.parentNode) {
        mountedContainer.parentNode.removeChild(mountedContainer);
      }
      setCtaMount(null);
    };
  }, [ready]);

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

      {/* When the DOM anchor after h1 is ready, portal directly into it; otherwise render in responsive overlay */}
      {ctaMount ? (
        createPortal(
          <HeroButtons
            isDark={isDark}
            onLogin={onLogin}
            onSignUp={onSignUp}
            onDashboard={onDashboard}
            loginText={loginText}
            signUpText={signUpText}
            dashboardText={dashboardText}
          />,
          ctaMount
        )
      ) : ready ? (
        <div className="absolute z-40 bottom-14 left-8 md:bottom-16 md:left-16 pointer-events-auto">
          <HeroButtons
            isDark={isDark}
            onLogin={onLogin}
            onSignUp={onSignUp}
            onDashboard={onDashboard}
            loginText={loginText}
            signUpText={signUpText}
            dashboardText={dashboardText}
          />
        </div>
      ) : null}
    </section>
  );
}

export default SliderRevolutionHero;
