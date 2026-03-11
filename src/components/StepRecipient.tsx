import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface StepRecipientProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const slideIn = {
  initial: { opacity: 0, x: 80 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -80 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

const StepRecipient = ({ value, onChange, onNext, onBack }: StepRecipientProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 350);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) onNext();
  };

  return (
    <motion.div {...slideIn} className="relative z-10 flex min-h-screen flex-col px-6">
      <div className="flex items-center justify-between pt-8">
        <button
          onClick={onBack}
          className="font-body text-sm text-muted-foreground transition-opacity hover:opacity-70"
        >
          ← Back
        </button>
        <span className="font-body text-xs text-muted-foreground">1 of 4</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <h2 className="mb-12 font-heading text-3xl text-foreground sm:text-4xl">
          Who's this for?
        </h2>

        <input
          ref={inputRef}
          className="input-underline mx-auto max-w-md text-center text-2xl"
          placeholder="Their name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={100}
        />
      </div>

      <div className="pb-10">
        <button
          onClick={onNext}
          disabled={!value.trim()}
          className="w-full rounded-xl bg-foreground py-4 font-heading text-lg text-background transition-opacity disabled:opacity-30"
        >
          Continue →
        </button>
      </div>
    </motion.div>
  );
};

export default StepRecipient;
