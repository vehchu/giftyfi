import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect, useRef } from "react";

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
}

const MOCK_SONGS: Song[] = [
  { id: "1", title: "Midnight City", artist: "M83", album: "Hurry Up, We're Dreaming" },
  { id: "2", title: "Retrograde", artist: "James Blake", album: "Overgrown" },
  { id: "3", title: "Space Song", artist: "Beach House", album: "Depression Cherry" },
  { id: "4", title: "Pink + White", artist: "Frank Ocean", album: "Blonde" },
  { id: "5", title: "The Less I Know the Better", artist: "Tame Impala", album: "Currents" },
  { id: "6", title: "Myth", artist: "Beach House", album: "Bloom" },
  { id: "7", title: "Redbone", artist: "Childish Gambino", album: "Awaken, My Love!" },
  { id: "8", title: "Do I Wanna Know?", artist: "Arctic Monkeys", album: "AM" },
  { id: "9", title: "Nights", artist: "Frank Ocean", album: "Blonde" },
  { id: "10", title: "Let It Happen", artist: "Tame Impala", album: "Currents" },
  { id: "11", title: "Motion Sickness", artist: "Phoebe Bridgers", album: "Stranger in the Alps" },
  { id: "12", title: "Alright", artist: "Kendrick Lamar", album: "To Pimp a Butterfly" },
];

interface StepSongSelectProps {
  selectedSong: Song | null;
  onSelect: (song: Song) => void;
  onNext: () => void;
  onBack: () => void;
}

const slideIn = {
  initial: { opacity: 0, x: 80 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -80 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

const StepSongSelect = ({ selectedSong, onSelect, onNext, onBack }: StepSongSelectProps) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 350);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return MOCK_SONGS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <motion.div {...slideIn} className="relative z-10 flex min-h-screen flex-col px-6">
      <div className="flex items-center justify-between pt-8">
        <button
          onClick={onBack}
          className="font-body text-sm text-muted-foreground transition-opacity hover:opacity-70"
        >
          ← Back
        </button>
        <span className="font-body text-xs text-muted-foreground">3 of 4</span>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <h2 className="mb-12 text-center font-heading text-3xl text-foreground sm:text-4xl">
          Pick the song
        </h2>

        <input
          ref={inputRef}
          className="input-underline text-center text-lg"
          placeholder="Song, artist, or album…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="mt-8 min-h-[200px]">
          <AnimatePresence mode="wait">
            {!query.trim() && !selectedSong && (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center font-body text-sm text-muted-foreground"
              >
                Start typing to search
              </motion.p>
            )}

            {query.trim() && results.length === 0 && (
              <motion.p
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center font-body text-sm text-muted-foreground"
              >
                Nothing came up. Try a different title or artist.
              </motion.p>
            )}

            {results.length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4"
              >
                {results.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => onSelect(song)}
                    className={`rounded-lg px-4 py-3 text-left transition-all ${
                      selectedSong?.id === song.id
                        ? "bg-secondary"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <p className="font-body text-base text-foreground">{song.title}</p>
                    <p className="font-body text-sm text-muted-foreground">
                      {song.artist} · {song.album}
                    </p>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {selectedSong && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 border-b border-border pb-4"
            >
              <p className="mb-1 font-body text-xs uppercase tracking-widest text-muted-foreground">
                Your pick
              </p>
              <p className="font-body text-base text-foreground">{selectedSong.title}</p>
              <p className="font-body text-sm text-muted-foreground">{selectedSong.artist}</p>
            </motion.div>
          )}
        </div>
      </div>

      <div className="pb-10">
        <button
          onClick={onNext}
          disabled={!selectedSong}
          className="w-full rounded-xl bg-foreground py-4 font-heading text-lg text-background transition-opacity disabled:opacity-30"
        >
          This is the one →
        </button>
      </div>
    </motion.div>
  );
};

export default StepSongSelect;
