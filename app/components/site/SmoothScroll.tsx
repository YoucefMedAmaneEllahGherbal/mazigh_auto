"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";

/**
 * Public-site only: Lenis smooth scrolling + light scroll-reveal.
 * - Never mounted in /admin (tables and forms should scroll natively).
 * - Disabled entirely when the visitor prefers reduced motion.
 * - Elements opt in to the reveal with `data-reveal` (optionally `data-reveal-delay="1..4"`).
 */
function SmoothScrollEffects({ pathname }: { pathname: string | null }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let cancelled = false;
    let frame = 0;

    import("lenis").then(({ default: LenisCtor }) => {
      if (cancelled) return;
      const lenis = new LenisCtor({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        anchors: { offset: -88 },
      });
      lenisRef.current = lenis;

      const raf = (time: number) => {
        lenis.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Scroll reveal, re-scanned on every route change.
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Anything already on screen stays visible (no flash); only below-the-fold
    // content gets the fade-up.
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)"),
    ).filter((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight * 0.92) {
        element.classList.add("is-revealed");
        return false;
      }
      return true;
    });
    root.classList.add("js-reveal");
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}

function SmoothScrollWithPath() {
  const pathname = usePathname();
  return <SmoothScrollEffects pathname={pathname} />;
}

export function SmoothScroll() {
  return (
    <Suspense fallback={null}>
      <SmoothScrollWithPath />
    </Suspense>
  );
}
