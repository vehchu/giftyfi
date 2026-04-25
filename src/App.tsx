import { useState, useEffect, useRef } from 'react'
import GiftAnimation from './GiftAnimation'
import { SongCard } from './SongCard'
import { ArrowLeftIcon, SpotifyLogoIcon } from "@phosphor-icons/react";

export interface Track {
  name: string
  artist: string
  album: string
  image_url: string | null
  spotify_url: string | null
  preview_url: string | null
  duration_ms: number | null
  release_date: string | null
  sender?: string | null
  recipient?: string | null
  note?: string | null
}

function giftCode(): string | null {
  const m = window.location.pathname.match(/^\/gift\/([^/]+)/)
  return m ? m[1] : null
}

function BackgroundGradient() {
  const tri = 'polygon(50% 0%, 100% 100%, 0% 100%)'
  // Each triangle: outer div = blur + position, inner div = clipPath + color
  // This is the only pattern that works correctly on iOS Safari
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-[var(--black)]">
      {/* Red */}
      <div style={{ position: 'absolute', bottom: '-10%', left: '0%', width: '55%', height: '75%', filter: 'blur(100px)' }}>
        <div style={{ width: '100%', height: '100%', background: 'var(--red)', clipPath: tri, opacity: 0.85 }} />
      </div>
      {/* Pink */}
      <div style={{ position: 'absolute', bottom: '-10%', left: '30%', width: '45%', height: '60%', filter: 'blur(100px)' }}>
        <div style={{ width: '100%', height: '100%', background: 'var(--pink)', clipPath: tri, opacity: 0.80 }} />
      </div>
      {/* Purple */}
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '50%', height: '75%', filter: 'blur(100px)' }}>
        <div style={{ width: '100%', height: '100%', background: 'var(--purple)', clipPath: tri, opacity: 0.85 }} />
      </div>
      {/* Orange */}
      <div style={{ position: 'absolute', bottom: '-5%', left: '-10%', width: '40%', height: '50%', filter: 'blur(100px)' }}>
        <div style={{ width: '100%', height: '100%', background: 'var(--orange)', clipPath: tri, opacity: 0.55 }} />
      </div>
      {/* Grain — dark-based, overlay blend, gamma-corrected to skew near black */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'overlay', opacity: 0.6 }}>
        <defs>
          <filter id="grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grey" />
            <feComponentTransfer in="grey">
              <feFuncR type="gamma" amplitude="2" exponent="3" offset="0" />
              <feFuncG type="gamma" amplitude="1" exponent="3" offset="0" />
              <feFuncB type="gamma" amplitude="3" exponent="3" offset="0" />
            </feComponentTransfer>
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  )
}

// ── Gift Reveal ────────────────────────────────────────────────────────────────
function GiftReveal({ code }: { code: string }) {
  const [track, setTrack] = useState<Track | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAnimation, setShowAnimation] = useState(true)
  const [playing, setPlaying] = useState(false)
  const audio = useRef(new Audio())

  useEffect(() => {
    fetch(`/api/gift/${code}`)
      .then(r => r.json())
      .then(d => {
        setTrack(d.song ?? null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [code])

  function togglePreview() {
    if (!track?.preview_url) return
    if (playing) {
      audio.current.pause()
      setPlaying(false)
    } else {
      audio.current.src = track.preview_url
      audio.current.play()
      setPlaying(true)
      audio.current.onended = () => setPlaying(false)
    }
  }

  if (loading) return <Loader />
  if (!track) return (
    <Screen><p className="text-[var(--white)/5]">Gift not found.</p></Screen>
  )

  if (showAnimation) {
    return <GiftAnimation onComplete={() => setShowAnimation(false)} />
  }

  return (
    <div className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center p-6 overflow-x-hidden">
      <BackgroundGradient />

      <div className="w-full max-w-sm flex flex-col gap-6 animate-fade-in-up">
        <SongCard
          track={track}
          recipient={track.recipient}
          message={track.note}
          sender={track.sender}
          playing={playing}
          togglePreview={togglePreview}
          showPreviewButton={true}
        />

        <div className="flex flex-col gap-3">
          {track.spotify_url && (
            <a
              href={track.spotify_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#1db954] hover:bg-[#1ed760] text-[var(--black)] font-bold rounded-3xl transition-colors text-sm"
            >
              <SpotifyLogoIcon className="w-5 h-5" />
              Open on Spotify
            </a>
          )}
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-3.5 text-[var(--white)] hover:text-[var(--white)] border border-[var(--white)] hover:bg-[var(--grey)] rounded-3xl transition-all text-sm font-semibold text-center"
          >
            Send a song too!
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Search App ─────────────────────────────────────────────────────────────────
type Phase = 'idle' | 'searching' | 'results' | 'compose_recipient' | 'compose_message' | 'compose_sender' | 'compose_confirm' | 'gifting' | 'done'

function SearchApp() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [query, setQuery] = useState('')
  const [tracks, setTracks] = useState<Track[]>([])
  const [picked, setPicked] = useState<Track | null>(null)

  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState('')
  const [sender, setSender] = useState('')

  const [giftLink, setGiftLink] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function search() {
    if (!query.trim()) return
    setPhase('searching'); setError('')
    try {
      const r = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Search failed')
      setTracks(d.tracks)
      setPhase('results')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
      setPhase('idle')
    }
  }

  function pickTrack(track: Track) {
    setPicked(track)
    setPhase('compose_recipient')
  }

  async function gift() {
    setPhase('gifting')
    try {
      const r = await fetch('/api/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track: picked, recipient, sender, message }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed to create gift')
      setGiftLink(d.gift_link)
      setPhase('done')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
      setPhase('compose_confirm')
    }
  }

  function copy() {
    navigator.clipboard.writeText(giftLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function reset() {
    setPhase('idle')
    setQuery('')
    setTracks([])
    setPicked(null)
    setError('')
    setRecipient('')
    setSender('')
    setMessage('')
  }

  // Common UI Layout per Figma
  return (
    <div className="relative z-10 min-h-[100dvh] flex flex-col justify-center p-6 mx-auto w-full max-w-sm">
      <BackgroundGradient />
      <p className="fixed bottom-4 left-0 right-0 text-center text-[12px] text-[var(--white)] pointer-events-none select-none z-50">
        Made with 💖
      </p>

      {/* Screen 1: Idle */}
      {(phase === 'idle' || phase === 'searching') && (
        <div className="w-full flex flex-col items-center justify-center -mt-16 animate-fade-in-up">
          <p className="text-[var(--white)] text-sm mb-2">Welcome to</p>
          <h1
            className="text-6xl text-[var(--white)] tracking-tight mb-16"
            style={{ fontFamily: "'BBH Hegarty', serif", WebkitFontSmoothing: 'antialiased' }}
          >
            Giftyfi
          </h1>
          <div className="w-full">
            <input
              autoFocus
              className="w-full bg-transparent border-b border-[var(--grey)] py-3 text-[var(--white)] placeholder-[var(--grey)] focus:outline-none focus:border-[var(--white)] transition-colors text-center text-lg shadow-none"
              placeholder="Enter Song"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              disabled={phase === 'searching'}
            />
            {phase === 'searching' && (
              <div className="mt-6 flex justify-center text-[var(--[purple])/50]">
                <Spin />
              </div>
            )}
            {error && (
              <p className="mt-4 text-red-400 text-sm text-center">{error}</p>
            )}
          </div>
        </div>
      )}

      {/* Results - minimal list */}
      {phase === 'results' && (
        <div className="w-full animate-fade-in-up">
          <button onClick={() => setPhase('idle')} className="text-[var(--grey)] mb-6 hover:text-[var(--white)] transition-colors flex items-center gap-2">
            <ArrowLeftIcon className="w-5 h-5" /> Back
          </button>
          <p className="text-[var(--white)] text-sm mb-4">Select a song:</p>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {tracks.map((t, i) => (
              <button
                key={i}
                onClick={() => pickTrack(t)}
                className="w-full flex items-center gap-4 p-3 bg-[var(--grey)] hover:bg-[var(--grey)] border border-[var(--grey)] rounded-2xl transition-all text-left group"
              >
                {t.image_url ? (
                  <img src={t.image_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[var(--grey)] flex items-center justify-center text-lg">♪</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--white)] text-sm truncate">{t.name}</p>
                  <p className="text-[var(--white)] text-xs truncate mt-0.5">{t.artist}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Flow Wrappers */}
      {(phase === 'compose_recipient' || phase === 'compose_message' || phase === 'compose_sender' || phase === 'compose_confirm' || phase === 'gifting' || phase === 'done') && picked && (
        <div className="flex flex-col h-full animate-fade-in-up">
          {/* Header Back Button conditionally visible */}
          {(phase !== 'done' && phase !== 'gifting') && (
            <button
              onClick={() => {
                if (phase === 'compose_recipient') setPhase('results')
                if (phase === 'compose_message') setPhase('compose_recipient')
                if (phase === 'compose_sender') setPhase('compose_message')
                if (phase === 'compose_confirm') setPhase('compose_sender')
              }}
              className="text-[var(--grey)] hover:text-[var(--white)] mb-6 self-start p-2 -ml-2 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
          )}

          <div className="flex-1 flex flex-col items-center justify-center gap-10">
            {/* Context Card */}
            <div className={`w-full transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${phase === 'done' ? 'scale-100' : 'scale-95 opacity-90'
              }`}>
              <SongCard
                track={picked}
                recipient={phase !== 'compose_recipient' ? recipient : ''}
                message={phase === 'compose_sender' || phase === 'compose_confirm' || phase === 'done' ? message : ''}
                sender={phase === 'compose_confirm' || phase === 'done' ? sender : ''}
              />
            </div>

            {/* Forms section */}
            <div className="w-full p-2">
              {phase === 'compose_recipient' && (
                <div className="text-center w-full animate-fade-in-up">
                  <p className="text-[var(--white)] text-lg mb-6">Who's this for?</p>
                  <input
                    autoFocus
                    className="w-full bg-transparent border-b border-[var(--grey] py-3 text-[var(--white)] placeholder-[var(--grey)] focus:outline-none focus:border-[var(--white)] transition-colors text-center text-sm"
                    placeholder="Name of recipient (optional)"
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && setPhase('compose_message')}
                  />
                  {/* Provide a next button as well for mobile users if they don't hit enter */}
                  <button onClick={() => setPhase('compose_message')} className="mt-6 text-xs text[var(--grey)] hover:text-[var(--white)] uppercase tracking-widest font-semibold">Next</button>
                </div>
              )}

              {phase === 'compose_message' && (
                <div className="text-center w-full animate-fade-in-up">
                  <p className="text-[var(--white)] text-lg mb-6">What do you want to say?</p>
                  <div className="relative">
                    <input
                      autoFocus
                      maxLength={200}
                      className="w-full bg-transparent border-b border-[var(--grey)] py-3 text-[var(--white)] placeholder-[var(--grey)] focus:outline-none focus:border-[var(--white)] transition-colors text-center text-sm"
                      placeholder="Enter your message"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && setPhase('compose_sender')}
                    />
                    <div className="absolute right-0 top-3 text-[10px] text[var(--white)/50]">{message.length}/200</div>
                  </div>
                  <button onClick={() => setPhase('compose_sender')} className="mt-6 text-xs text-[var(--white)/50] hover:text-white uppercase tracking-widest font-semibold">Next</button>
                </div>
              )}

              {phase === 'compose_sender' && (
                <div className="text-center w-full animate-fade-in-up">
                  <p className="text-[var(--white)] text-lg mb-6">Who's this from?</p>
                  <input
                    autoFocus
                    className="w-full bg-transparent border-b border-[var(--grey)] py-3 text-[var(--white)] placeholder-[var(--grey)] focus:outline-none focus:border-[var(--white)] transition-colors text-center text-sm"
                    placeholder="Enter your name (optional)"
                    value={sender}
                    onChange={e => setSender(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && setPhase('compose_confirm')}
                  />
                  <button onClick={() => setPhase('compose_confirm')} className="mt-6 text-xs text[var(--grey)] hover:text-[var(--white)] uppercase tracking-widest font-semibold">Next</button>
                </div>
              )}

              {phase === 'compose_confirm' && (
                <div className="text-center w-full animate-fade-in-up">
                  <p className="text-[var(--white)] text-lg mb-6">Are you ready to send this?</p>
                  {error && <p className="text-red-400 text-xs mb-4">{error}</p>}
                  <div className="flex gap-4 items-center justify-center">
                    <button
                      onClick={() => setPhase('compose_sender')}
                      className="px-6 py-2.5 rounded-full text-sm font-semibold text-[var(--white)] hover:text-[var(--pink)] border border-transparent hover:border-[var(--pink)] transition-all"
                    >
                      Not yet
                    </button>
                    <button
                      onClick={gift}
                      className="px-8 py-2.5 rounded-full bg-[var(--purple)] hover:bg-[var(--purple)] text-white text-sm font-semibold transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-600/20"
                    >
                      It's perfect
                    </button>
                  </div>
                </div>
              )}

              {phase === 'gifting' && (
                <div className="text-center w-full flex flex-col items-center justify-center text[var(--grey)] text-sm gap-4">
                  <Spin /> Creating gift link...
                </div>
              )}

              {phase === 'done' && (
                <div className="text-center w-full animate-fade-in-up text-left">
                  <p className="text[var(--white)] text-xs font-semibold mb-2 ml-1">Gift Link</p>
                  <div className="flex border border-[var(--purple)] rounded-3xl p-2 items-center">
                    <input
                      readOnly
                      value={giftLink}
                      className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text[var(--white)] min-w-0 outline-none"
                    />
                    <button
                      onClick={copy}
                      className={`px-5 py-2 rounded-3xl text-xs font-bold transition-all flex-shrink-0 ${copied ? 'bg-[var(--white)] text-[var(--purple)]' : 'bg-[var(--purple)] hover:bg-purple-500 text-[var(--white)]'
                        }`}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <button
                    onClick={reset}
                    className="mt-8 text[var(--grey)] hover:text[var(--grey)] text-xs transition-colors flex items-center justify-center w-full"
                  >
                    <ArrowLeftIcon className="w-5 h-5" /> Send another song
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function Spin() {
  return <span className="inline-block w-5 h-5 border-2 border-[var(--grey)] border-t-[var(--purple)] rounded-full animate-spin" />
}
function Loader() {
  return <Screen><Spin /></Screen>
}
function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 text-[var(--white)]">
      {children}
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function App() {
  const code = giftCode()
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=BBH+Hegarty&display=swap');
      `}</style>
      {code ? <GiftReveal code={code} /> : <SearchApp />}
    </>
  )
}
