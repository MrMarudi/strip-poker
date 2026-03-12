"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

export default function GoldParticles() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: false,
      fpsLimit: 60,
      particles: {
        color: { value: ["#d4af37", "#f0d060", "#b8941f"] },
        move: {
          enable: true,
          speed: 0.8,
          direction: "none" as const,
          outModes: { default: "out" as const },
          random: true,
        },
        number: { value: 40, density: { enable: true } },
        opacity: {
          value: { min: 0.1, max: 0.6 },
          animation: { enable: true, speed: 0.5, sync: false },
        },
        shape: { type: "circle" },
        size: {
          value: { min: 1, max: 4 },
          animation: { enable: true, speed: 2, sync: false },
        },
      },
      detectRetina: true,
    }),
    []
  );

  if (!init) return null;

  return (
    <Particles
      id="gold-particles"
      className="absolute inset-0 pointer-events-none"
      options={options}
    />
  );
}
