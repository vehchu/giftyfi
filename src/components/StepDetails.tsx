import { motion } from "framer-motion";
import { useState } from "react";

interface GiftDetails {
  recipientName: string;
  message: string;
  senderName: string;
  senderEmail: string;
}

interface StepDetailsProps {
  details: GiftDetails;
  onChange: (details: GiftDetails) => void;
  onNext: () => void;
}

const StepDetails = ({ details, onChange, onNext }: StepDetailsProps) => {
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!details.recipientName.trim()) {
      setError("Who's this for?");
      return;
    }
    setError("");
    onNext();
  };

  const update = (field: keyof GiftDetails, value: string) => {
    onChange({ ...details, [field]: value });
    if (error && field === "recipientName" && value.trim()) setError("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="relative z-10 flex min-h-screen flex-col justify-center px-6 py-20"
    >
      <div className="mx-auto w-full max-w-md">
        <p className="mb-16 font-body text-sm text-muted-foreground">Who's this for?</p>

        <div className="flex flex-col gap-16">
          <div className="flex flex-col gap-2">
            <label className="font-body text-sm text-foreground">Their name</label>
            <input
              className="input-underline"
              placeholder="Alex"
              value={details.recipientName}
              onChange={(e) => update("recipientName", e.target.value)}
              maxLength={100}
            />
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-1 font-body text-xs text-accent"
              >
                {error}
              </motion.p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-body text-sm text-foreground">What you want to say</label>
            <textarea
              className="input-underline resize-none"
              placeholder="This song always reminds me of you."
              rows={3}
              value={details.message}
              onChange={(e) => update("message", e.target.value)}
              maxLength={1000}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-body text-sm text-foreground">Your name (optional)</label>
            <input
              className="input-underline"
              placeholder="Leave blank to stay anonymous"
              value={details.senderName}
              onChange={(e) => update("senderName", e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-body text-sm text-foreground">Your email</label>
            <input
              className="input-underline"
              type="email"
              placeholder="yours@email.com"
              value={details.senderEmail}
              onChange={(e) => update("senderEmail", e.target.value)}
              maxLength={255}
            />
            <p className="mt-1 font-body text-xs text-muted-foreground">
              For your records only — never shared.
            </p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="mt-16 font-heading text-lg text-foreground transition-opacity hover:opacity-70"
        >
          Choose a song →
        </motion.button>
      </div>
    </motion.div>
  );
};

export default StepDetails;
