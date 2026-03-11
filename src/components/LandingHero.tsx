import { motion } from "framer-motion";

interface LandingHeroProps {
  onCreateGift: () => void;
  onPreview: () => void;
}

const LandingHero = ({ onCreateGift, onPreview }: LandingHeroProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="font-heading text-4xl leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl"
      >
        Music has meaning.
        <br />
        Send that song.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mt-6 max-w-md font-body text-base text-muted-foreground"
      >
        Pair a song with a message. Share it as a gift.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="mt-12 flex flex-col items-center gap-4"
      >
        <button
          onClick={onCreateGift}
          className="font-heading text-lg text-foreground transition-opacity hover:opacity-70"
        >
          Create a gift →
        </button>

        <button
          onClick={onPreview}
          className="font-body text-sm text-muted-foreground transition-opacity hover:opacity-70"
        >
          See what it feels like ↗
        </button>
      </motion.div>
    </motion.div>
  );
};

export default LandingHero;
