import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

interface GiftRevealProps {
  recipientName: string;
  message: string;
  songTitle: string;
  artist: string;
  senderName: string;
  onGenerate: () => void;
}

const Particle = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.div
    initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
    animate={{
      opacity: [1, 1, 0],
      scale: [0, 1, 0.5],
      x: x,
      y: y,
    }}
    transition={{ duration: 1.2, delay, ease: "easeOut" }}
    className="absolute rounded-full"
    style={{
      width: Math.random() * 6 + 3,
      height: Math.random() * 6 + 3,
      background: `hsl(${[45, 35, 25, 340, 30][Math.floor(Math.random() * 5)]}, ${70 + Math.random() * 30}%, ${50 + Math.random() * 20}%)`,
    }}
  />
);

const GiftReveal = ({
  recipientName,
  message,
  songTitle,
  artist,
  senderName,
  onGenerate,
}: GiftRevealProps) => {
  const [phase, setPhase] = useState(0);
  const [runKey, setRunKey] = useState(0);

  const runSequence = useCallback(() => {
    setPhase(0);
    const timings = [400, 1200, 2000, 2400, 2800, 3400, 4200, 5000, 5600];
    timings.forEach((t, i) => {
      setTimeout(() => setPhase(i + 1), t);
    });
  }, []);

  useEffect(() => {
    runSequence();
  }, [runSequence, runKey]);

  const replay = () => {
    setRunKey((k) => k + 1);
  };

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: 1.2 + Math.random() * 0.3,
    x: (Math.random() - 0.5) * 300,
    y: (Math.random() - 0.5) * 300,
  }));

  const animDone = phase >= 9;

  return (
    <motion.div
      key={runKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6"
    >
      {/* Center breathing glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="h-64 w-64 rounded-full"
          style={{ background: "radial-gradient(circle, hsla(45, 100%, 50%, 0.2), transparent 70%)" }}
        />
      </div>

      {/* Replay button */}
      <AnimatePresence>
        {animDone && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={replay}
            className="absolute right-6 top-8 flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Replay"
          >
            ↻
          </motion.button>
        )}
      </AnimatePresence>

      {/* Gift box phase (1-3) */}
      <AnimatePresence>
        {phase >= 1 && phase < 4 && (
          <motion.div
            key="gift-box"
            className="relative flex flex-col items-center"
            exit={{ opacity: 0, y: 40, transition: { duration: 0.4 } }}
          >
            {/* Gift box */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="text-7xl"
            >
              🎁
            </motion.div>

            {/* Lid pop */}
            {phase >= 2 && (
              <motion.div
                initial={{ y: 0, rotate: 0 }}
                animate={{ y: -40, rotate: -20, opacity: [1, 1, 0] }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute -top-2 text-5xl"
              >
                🎀
              </motion.div>
            )}

            {/* Particles */}
            {phase >= 2 && (
              <div className="absolute inset-0 flex items-center justify-center">
                {particles.map((p) => (
                  <Particle key={`${runKey}-${p.id}`} delay={0} x={p.x} y={p.y} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text reveals (phase 4+) */}
      <div className="flex flex-col items-center gap-6">
        <AnimatePresence>
          {phase >= 4 && (
            <motion.p
              key="foryou"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-body text-sm italic text-muted-foreground"
            >
              for you
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase >= 5 && (
            <motion.p
              key="hi"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-heading text-3xl text-foreground"
            >
              Hi, {recipientName}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase >= 6 && (
            <motion.p
              key="msg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-sm text-center font-body text-xl italic text-foreground"
            >
              "{message || "..."}"
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase >= 7 && (
            <motion.div
              key="song"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-secondary shadow-lg shadow-accent/10">
                <span className="text-2xl">🎶</span>
              </div>
              <div>
                <p className="font-body text-base text-foreground">{songTitle}</p>
                <p className="font-body text-sm text-muted-foreground">{artist}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase >= 8 && (
            <motion.p
              key="from"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mt-4 font-body text-sm text-muted-foreground"
            >
              From: {senderName || "someone special"}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom actions */}
      <AnimatePresence>
        {phase >= 9 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute bottom-10 left-6 right-6 flex flex-col items-center gap-4"
          >
            <button
              onClick={onGenerate}
              className="w-full max-w-md rounded-xl py-4 font-heading text-lg text-background"
              style={{
                background: "linear-gradient(135deg, hsl(25, 80%, 50%), hsl(45, 100%, 50%))",
              }}
            >
              Generate my gift link <span>✦</span>
            </button>

            <button
              onClick={replay}
              className="font-body text-sm text-muted-foreground transition-opacity hover:opacity-70"
            >
              Watch again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GiftReveal;
