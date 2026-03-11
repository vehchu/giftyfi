import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import AuroraBackground from "@/components/AuroraBackground";
import LandingHero from "@/components/LandingHero";
import StepRecipient from "@/components/StepRecipient";
import StepMessage from "@/components/StepMessage";
import StepSongSelect from "@/components/StepSongSelect";
import type { Song } from "@/components/StepSongSelect";
import StepSender from "@/components/StepSender";
import GiftReveal from "@/components/GiftReveal";
import GiftLinkScreen from "@/components/GiftLinkScreen";
import RecipientReveal from "@/components/RecipientReveal";

type Screen =
  | "landing"
  | "recipient"
  | "message"
  | "song"
  | "sender"
  | "gift-reveal"
  | "link"
  | "reveal";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("landing");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [giftId] = useState(() => crypto.randomUUID().slice(0, 8));

  const reset = () => {
    setScreen("landing");
    setRecipientName("");
    setMessage("");
    setSenderName("");
    setSelectedSong(null);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuroraBackground />

      <AnimatePresence mode="wait">
        {screen === "landing" && (
          <LandingHero
            key="landing"
            onCreateGift={() => setScreen("recipient")}
            onPreview={() => setScreen("reveal")}
          />
        )}

        {screen === "recipient" && (
          <StepRecipient
            key="recipient"
            value={recipientName}
            onChange={setRecipientName}
            onNext={() => setScreen("message")}
            onBack={() => setScreen("landing")}
          />
        )}

        {screen === "message" && (
          <StepMessage
            key="message"
            value={message}
            onChange={setMessage}
            onNext={() => setScreen("song")}
            onBack={() => setScreen("recipient")}
          />
        )}

        {screen === "song" && (
          <StepSongSelect
            key="song"
            selectedSong={selectedSong}
            onSelect={setSelectedSong}
            onNext={() => setScreen("sender")}
            onBack={() => setScreen("message")}
          />
        )}

        {screen === "sender" && (
          <StepSender
            key="sender"
            value={senderName}
            onChange={setSenderName}
            onNext={() => setScreen("gift-reveal")}
            onBack={() => setScreen("song")}
          />
        )}

        {screen === "gift-reveal" && selectedSong && (
          <GiftReveal
            key="gift-reveal"
            recipientName={recipientName}
            message={message}
            songTitle={selectedSong.title}
            artist={selectedSong.artist}
            senderName={senderName}
            onGenerate={() => setScreen("link")}
          />
        )}

        {screen === "link" && selectedSong && (
          <GiftLinkScreen
            key="link"
            giftId={giftId}
            onPreview={() => setScreen("reveal")}
            onAnother={reset}
          />
        )}

        {screen === "reveal" && (
          <RecipientReveal
            key="reveal"
            recipientName={recipientName || "you"}
            message={message || "This song always reminds me of you."}
            songTitle={selectedSong?.title || "Space Song"}
            artist={selectedSong?.artist || "Beach House"}
            senderName={senderName}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
