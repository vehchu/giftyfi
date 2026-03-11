import { motion } from "framer-motion";
import { useState } from "react";

interface GiftLinkScreenProps {
  giftId: string;
  onPreview: () => void;
  onAnother: () => void;
}

const GiftLinkScreen = ({ giftId, onPreview, onAnother }: GiftLinkScreenProps) => {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/gift/${giftId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-heading text-3xl text-foreground"
      >
        Your gift is ready.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 font-body text-base text-muted-foreground"
      >
        Copy the link and send it however feels right.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-12 flex flex-col items-center gap-6"
      >
        <button
          onClick={handleCopy}
          className={`font-heading text-lg transition-all ${
            copied ? "text-accent" : "text-foreground hover:opacity-70"
          }`}
        >
          {copied ? "Copied ✓" : "Copy link"}
        </button>

        <button
          onClick={onPreview}
          className="font-body text-sm text-muted-foreground transition-opacity hover:opacity-70"
        >
          Preview the experience
        </button>

        <button
          onClick={onAnother}
          className="font-body text-sm text-muted-foreground transition-opacity hover:opacity-70"
        >
          Send another →
        </button>
      </motion.div>
    </motion.div>
  );
};

export default GiftLinkScreen;
