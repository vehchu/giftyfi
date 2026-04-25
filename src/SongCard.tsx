import { Track } from './App'
import { PlayIcon, PauseIcon } from "@phosphor-icons/react";


interface SongCardProps {
  track: Track
  recipient?: string | null
  message?: string | null
  sender?: string | null
  playing?: boolean
  togglePreview?: () => void
  showPreviewButton?: boolean
}

export function SongCard({ track, recipient, message, sender, playing, togglePreview, showPreviewButton }: SongCardProps) {
  return (
    <div className="bg-[#292825]/20 backdrop-blur-2xl rounded-3xl overflow-hidden border border-[var(--grey)]  shadow-2xl relative w-full flex flex-col text-left">
      {track.image_url ? (
        <div className="relative w-full aspect-[4/3] flex-shrink-0">
          <img
            src={track.image_url}
            alt={track.album}
            className="w-full h-full object-cover"
            style={{
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)'
            }}
          />
          <div className="absolute inset-x-6 bottom-0 translate-y-1 z-20 pb-0 flex items-end">
            <h1 className="text-[1.7rem] font-bold text-[var(--white)] tracking-tight leading-tight drop-shadow-lg break-words">{track.name}</h1>
          </div>
        </div>
      ) : (
        <div className="relative w-full aspect-[4/3] bg-[var(--grey)] flex flex-col items-center justify-center text-5xl text-[var(--white)] flex-shrink-0">
          <span className="mb-8">♪</span>
          <div className="absolute inset-x-6 bottom-0 translate-y-1 z-20 pb-0 flex items-end">
            <h1 className="text-[1.7rem] font-bold text-[var(--white)] tracking-tight leading-tight drop-shadow-lg break-words">{track.name}</h1>
          </div>
        </div>
      )}

      {showPreviewButton && track.preview_url && (
        <button
          onClick={togglePreview}
          className="absolute top-4 right-4 w-10 h-10 bg-[var(--purple)] backdrop-blur hover:bg-[var(--purple)] rounded-full flex items-center justify-center text-sm text-[var(--white)] shadow-xl transition-all hover:scale-110 z-50 border border-[var(--white)/20]"
        >
          {playing ? <PauseIcon weight="fill" className="w-4 h-4" /> : <PlayIcon weight="fill" className="w-4 h-4" />}
        </button>
      )}

      <div className="px-6 pb-6 pt-1 relative z-10 flex-1 flex flex-col justify-start min-w-0">
        <p className="text-[var(--white)] text-[1.05rem] mt-1 break-words">{track.artist}</p>
        <p className="text-[var(--white)] text-sm mt-0.5 break-words">{track.album}</p>

        {(recipient || message || sender) && (
          <div className="mt-4 pt-4 border-t border-[var(--white)] space-y-1.5 flex-1 flex flex-col justify-end min-w-0">
            {recipient && <p className="text-[var(--white)] text-sm font-medium break-words">Hey {recipient}!</p>}
            {message && <p className="text-[var(--white)] text-sm italic whitespace-pre-wrap leading-relaxed break-words w-full">"{message}"</p>}
            {sender && <p className="text-[var(--pink)] text-xs font-bold !mt-3 text-right break-words">— From {sender}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
