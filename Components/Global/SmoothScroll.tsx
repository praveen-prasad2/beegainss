"use client";

import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        lerp: 0.11,
        wheelMultiplier: 1.12,
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
