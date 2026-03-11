import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";

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

interface StepSongProps {
  selectedSong: Song | null;
  onSelect: (song: Song) => void;
  onNext: () => void;
}

const StepSong = ({ selectedSong, onSelect, onNext }: StepSongProps) => {
  const [query, setQuery] = useState("");

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="relative z-10 flex min-h-screen flex-col justify-center px-6 py-20"
    >
      <div className="mx-auto w-full max-w-md">
        <p className="mb-16 font-body text-sm text-muted-foreground">Find the song</p>

        <div className="flex flex-col gap-2">
          <input
            className="input-underline"
            placeholder="Song, artist, or album…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="mt-8 min-h-[200px]">
          <AnimatePresence mode="wait">
            {!query.trim() && !selectedSong && (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-body text-sm text-muted-foreground"
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
                className="font-body text-sm text-muted-foreground"
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
                className="flex flex-col gap-6"
              >
                {results.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => onSelect(song)}
                    className={`text-left transition-opacity hover:opacity-70 ${
                      selectedSong?.id === song.id ? "opacity-100" : "opacity-60"
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
              className="mt-10 border-b border-border pb-4"
            >
              <p className="mb-2 font-body text-xs text-muted-foreground uppercase tracking-widest">
                Your pick
              </p>
              <p className="font-body text-base text-foreground">{selectedSong.title}</p>
              <p className="font-body text-sm text-muted-foreground">
                {selectedSong.artist}
              </p>
            </motion.div>
          )}
        </div>

        {selectedSong && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            className="mt-16 font-heading text-lg text-foreground transition-opacity hover:opacity-70"
          >
            Looks good →
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default StepSong;
