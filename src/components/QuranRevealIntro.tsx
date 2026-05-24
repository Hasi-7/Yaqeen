"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const INTRO_DURATION_MS = 4200;

export function QuranRevealIntro() {
  const [visible, setVisible] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      const reducedTimer = window.setTimeout(() => setVisible(false), 650);
      return () => window.clearTimeout(reducedTimer);
    }

    const timer = window.setTimeout(() => setVisible(false), INTRO_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[100] overflow-hidden bg-[#071f1b]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeInOut" } }}
          aria-label="Opening intro animation"
        >
          <div className="absolute inset-0 intro-geometric-pattern" />
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,239,184,0.26),transparent_34%),linear-gradient(180deg,rgba(7,31,27,0.08),rgba(7,31,27,0.52))]"
            initial={{ opacity: 0.45 }}
            animate={{ opacity: [0.45, 0.88, 0.2] }}
            transition={{ duration: reduceMotion ? 0.1 : 3.8, ease: "easeInOut" }}
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
            animate={{ opacity: reduceMotion ? 0 : [1, 1, 0.2] }}
            transition={{ duration: reduceMotion ? 0.1 : 3.9, times: [0, 0.82, 1], ease: "easeInOut" }}
          >
            <div className="intro-book-stage" aria-hidden="true">
              <motion.div
                className="intro-book-glow"
                initial={{ opacity: 0.24, scale: 0.78 }}
                animate={{ opacity: [0.24, 0.82, 0.58], scale: [0.78, 1.12, 1.35] }}
                transition={{ duration: reduceMotion ? 0.1 : 3.6, ease: "easeInOut" }}
              />

              <motion.div
                className="intro-book"
                initial={{ y: 16, rotateX: 14, scale: 0.88 }}
                animate={{ y: 0, rotateX: 0, scale: [0.88, 1, 1.08] }}
                transition={{ duration: reduceMotion ? 0.1 : 3.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  className="intro-cover intro-cover-left"
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: reduceMotion ? -108 : [0, -18, -142] }}
                  transition={{ duration: reduceMotion ? 0.1 : 3.05, times: [0, 0.2, 1], ease: [0.22, 1, 0.36, 1] }}
                >
                  <BookDecoration />
                </motion.div>
                <motion.div
                  className="intro-cover intro-cover-right"
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: reduceMotion ? 108 : [0, 18, 142] }}
                  transition={{ duration: reduceMotion ? 0.1 : 3.05, times: [0, 0.2, 1], ease: [0.22, 1, 0.36, 1] }}
                >
                  <BookDecoration />
                </motion.div>

                <div className="intro-pages intro-pages-left">
                  <PageLines />
                </div>
                <div className="intro-pages intro-pages-right">
                  <PageLines />
                </div>
                <motion.div
                  className="intro-page-turn"
                  initial={{ rotateY: 0, opacity: 0 }}
                  animate={{ rotateY: reduceMotion ? -112 : [0, -88, -168], opacity: [0, 1, 0.35] }}
                  transition={{ delay: reduceMotion ? 0 : 0.72, duration: reduceMotion ? 0.1 : 2.4, ease: "easeInOut" }}
                />
                <div className="intro-spine" />
              </motion.div>
            </div>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: reduceMotion ? 0 : [0, 1, 0], y: [10, 0, -8] }}
              transition={{ delay: reduceMotion ? 0 : 0.45, duration: reduceMotion ? 0.1 : 3.1, ease: "easeInOut" }}
            >
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#f3d88e]">Yaqeen</p>
              <p className="mt-2 text-lg text-white/78">Source-backed rulings from your marja</p>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function PageLines() {
  return (
    <div className="space-y-4">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

function BookDecoration() {
  return (
    <div className="intro-cover-decoration">
      <div />
      <span />
    </div>
  );
}
