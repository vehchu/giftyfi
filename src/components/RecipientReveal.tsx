import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface RecipientRevealProps {
  recipientName: string;
  message: string;
  songTitle: string;
  artist: string;
  senderName: string;
}

const STEP_DURATION = 2200;
const FADE_DURATION = 0.8;

const RecipientReveal = ({
  recipientName,
  message,
  songTitle,
  artist,
  senderName,
}: RecipientRevealProps) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step < 4) {
      const timer = setTimeout(() => setStep((s) => s + 1), STEP_DURATION);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Steps 0-1 fade out, steps 2-4 accumulate
  const showForYou = step === 0;
  const showHi = step === 1;
  const showMessage = step >= 2;
  const showSong = step >= 3;
  const showFrom = step >= 4;

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <AnimatePresence mode="wait">
        {showForYou && (
          <motion.p
            key="foryou"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FADE_DURATION }}
            className="font-body text-lg text-muted-foreground"
          >
            for you
          </motion.p>
        )}

        {showHi && (
          <motion.p
            key="hi"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FADE_DURATION }}
            className="font-heading text-2xl text-foreground"
          >
            Hi, {recipientName}
          </motion.p>
        )}
      </AnimatePresence>

      {showMessage && (
        <div className="flex flex-col items-center gap-8">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: FADE_DURATION }}
            className="max-w-sm font-body text-xl italic text-foreground"
          >
            "{message}"
          </motion.p>

          {showSong && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: FADE_DURATION }}
              className="font-body text-base text-foreground"
            >
              🎶 {songTitle} — {artist}
            </motion.p>
          )}

          {showFrom && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: FADE_DURATION }}
              className="font-body text-sm text-muted-foreground"
            >
              From: {senderName || "someone special"}
            </motion.p>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipientReveal;
