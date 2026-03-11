import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import AuroraBackground from "@/components/AuroraBackground";
import LandingHero from "@/components/LandingHero";
import StepDetails from "@/components/StepDetails";
import StepSong from "@/components/StepSong";
import type { Song } from "@/components/StepSong";
import StepPreview from "@/components/StepPreview";
import GiftLinkScreen from "@/components/GiftLinkScreen";
import RecipientReveal from "@/components/RecipientReveal";

type Screen = "landing" | "details" | "song" | "preview" | "link" | "reveal";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("landing");
  const [details, setDetails] = useState({
    recipientName: "",
    message: "",
    senderName: "",
    senderEmail: "",
  });
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [giftId] = useState(() => crypto.randomUUID().slice(0, 8));

  const reset = () => {
    setScreen("landing");
    setDetails({ recipientName: "", message: "", senderName: "", senderEmail: "" });
    setSelectedSong(null);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuroraBackground />

      <AnimatePresence mode="wait">
        {screen === "landing" && (
          <LandingHero
            key="landing"
            onCreateGift={() => setScreen("details")}
            onPreview={() => setScreen("reveal")}
          />
        )}

        {screen === "details" && (
          <StepDetails
            key="details"
            details={details}
            onChange={setDetails}
            onNext={() => setScreen("song")}
          />
        )}

        {screen === "song" && (
          <StepSong
            key="song"
            selectedSong={selectedSong}
            onSelect={setSelectedSong}
            onNext={() => setScreen("preview")}
          />
        )}

        {screen === "preview" && selectedSong && (
          <StepPreview
            key="preview"
            recipientName={details.recipientName}
            message={details.message}
            senderName={details.senderName}
            song={selectedSong}
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
            recipientName={details.recipientName || "you"}
            message={details.message || "This song always reminds me of you."}
            songTitle={selectedSong?.title || "Space Song"}
            artist={selectedSong?.artist || "Beach House"}
            senderName={details.senderName}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
