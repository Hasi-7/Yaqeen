"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const INTRO_DURATION_MS = 3200;

export function QuranRevealIntro() {
  const [visible, setVisible] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setTimeout(
      () => setVisible(false),
      reduceMotion ? 650 : INTRO_DURATION_MS,
    );

    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[100] overflow-hidden bg-[#071f1b]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.65, ease: "easeInOut" } }}
          aria-label="Yaqeen opening intro animation"
        >
          <div className="absolute inset-0 intro-geometric-pattern" />
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,239,184,0.32),transparent_34%),linear-gradient(180deg,rgba(7,31,27,0.02),rgba(7,31,27,0.58))]"
            initial={{ opacity: 0.55 }}
            animate={{ opacity: reduceMotion ? 0 : [0.55, 0.94, 0.22] }}
            transition={{ duration: 2.85, ease: "easeInOut" }}
          />

          <button
            type="button"
            onClick={() => setVisible(false)}
            className="absolute right-4 top-4 z-20 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/18 focus:outline-none focus:ring-2 focus:ring-[#f3d88e]"
          >
            Skip
          </button>

          <motion.div
            className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 text-center text-white"
            initial={{ opacity: 1 }}
            animate={{ opacity: reduceMotion ? 0 : [1, 1, 0.15] }}
            transition={{ duration: 3.05, times: [0, 0.84, 1], ease: "easeInOut" }}
          >
            <div className="relative grid place-items-center">
              <motion.div
                className="intro-logo-glow"
                initial={{ opacity: 0.35, scale: 0.72 }}
                animate={{ opacity: [0.35, 0.92, 0.52], scale: [0.72, 1.08, 1.26] }}
                transition={{ duration: reduceMotion ? 0.1 : 2.75, ease: "easeInOut" }}
                aria-hidden="true"
              />
              <motion.img
                src="/yaqeen-logo.svg"
                alt="Yaqeen logo"
                className="relative size-56 rounded-[2rem] shadow-2xl shadow-black/35 sm:size-72 md:size-80"
                initial={{ y: 18, scale: 0.78, opacity: 0, rotate: -3 }}
                animate={{
                  y: 0,
                  scale: reduceMotion ? 1 : [0.78, 1.04, 1.12],
                  opacity: [0, 1, 1],
                  rotate: 0,
                }}
                transition={{ duration: reduceMotion ? 0.1 : 2.45, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: reduceMotion ? 0 : [0, 1, 0], y: [10, 0, -8] }}
              transition={{ delay: reduceMotion ? 0 : 0.35, duration: reduceMotion ? 0.1 : 2.5, ease: "easeInOut" }}
            >
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#f3d88e]">Yaqeen</p>
              <p className="mt-2 max-w-md text-lg leading-7 text-white/78">
                Trusted Islamic scholarship, made accessible through verified sources.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
