"use client";

import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        lerp: 0.045,
        wheelMultiplier: 0.85,
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
