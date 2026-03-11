import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface StepMessageProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const slideIn = {
  initial: { opacity: 0, x: 80 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -80 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
};

const StepMessage = ({ value, onChange, onNext, onBack }: StepMessageProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 350);
  }, []);

  return (
    <motion.div {...slideIn} className="relative z-10 flex min-h-screen flex-col px-6">
      <div className="flex items-center justify-between pt-8">
        <button
          onClick={onBack}
          className="font-body text-sm text-muted-foreground transition-opacity hover:opacity-70"
        >
          ← Back
        </button>
        <span className="font-body text-xs text-muted-foreground">2 of 4</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <h2 className="mb-12 font-heading text-3xl text-foreground sm:text-4xl">
          What do you want to say?
        </h2>

        <textarea
          ref={textareaRef}
          className="input-underline mx-auto max-w-md resize-none text-center text-lg"
          placeholder="Write something from the heart…"
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={1000}
        />
      </div>

      <div className="pb-10">
        <button
          onClick={onNext}
          className="w-full rounded-xl bg-foreground py-4 font-heading text-lg text-background transition-opacity hover:opacity-90"
        >
          Continue →
        </button>
      </div>
    </motion.div>
  );
};

export default StepMessage;
