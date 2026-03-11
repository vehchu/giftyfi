import { motion } from "framer-motion";
import type { Song } from "./StepSong";

interface StepPreviewProps {
  recipientName: string;
  message: string;
  senderName: string;
  song: Song;
  onGenerate: () => void;
}

const StepPreview = ({ recipientName, message, senderName, song, onGenerate }: StepPreviewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="relative z-10 flex min-h-screen flex-col justify-center px-6 py-20"
    >
      <div className="mx-auto w-full max-w-md">
        <p className="mb-6 font-body text-sm text-muted-foreground">Before you send</p>
        <p className="mb-16 font-body text-base text-foreground">Here's what they'll see.</p>

        <div className="flex flex-col gap-8">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-body text-sm text-muted-foreground"
          >
            Hi, {recipientName}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="font-body text-lg italic text-foreground"
          >
            "{message || "..."}"
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="font-body text-base text-foreground"
          >
            🎶 {song.title} — {song.artist}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="font-body text-sm text-muted-foreground"
          >
            From: {senderName || "someone special"}
          </motion.p>
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGenerate}
          className="mt-16 font-heading text-lg text-foreground transition-opacity hover:opacity-70"
        >
          Generate gift link <span className="text-accent">✦</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default StepPreview;
