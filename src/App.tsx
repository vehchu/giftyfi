import { useState, useEffect, useRef } from 'react'

interface Track {
  name: string
  artist: string
  album: string
  image_url: string | null
  spotify_url: string | null
  preview_url: string | null
  duration_ms: number | null
  release_date: string | null
}

function giftCode(): string | null {
  const m = window.location.pathname.match(/^\/gift\/([^/]+)/)
  return m ? m[1] : null
}

function ms(d: number | null) {
  if (!d) return ''
  return `${Math.floor(d / 60000)}:${String(Math.floor((d % 60000) / 1000)).padStart(2, '0')}`
}

// ── Gift Reveal ────────────────────────────────────────────────────────────────
function GiftReveal({ code }: { code: string }) {
  const [track, setTrack] = useState<Track | null>(null)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const audio = useRef(new Audio())

  useEffect(() => {
    fetch(`/api/gift/${code}`)
      .then(r => r.json())
      .then(d => setTrack(d.song ?? null))
      .finally(() => setLoading(false))
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
    <Screen><p className="text-zinc-500">Gift not found.</p></Screen>
  )

  return (
    <Screen>
      <div className="w-full max-w-sm">
        <p className="text-center text-zinc-500 text-sm mb-6">🎁 Someone sent you a song</p>
        <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl shadow-purple-950/40">
          {track.image_url && (
            <div className="relative">
              <img src={track.image_url} alt={track.album} className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090f] via-transparent to-transparent" />
              {track.preview_url && (
                <button
                  onClick={togglePreview}
                  className="absolute bottom-4 right-4 w-12 h-12 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center text-lg shadow-lg transition-all hover:scale-110"
                >
                  {playing ? '⏸' : '▶'}
                </button>
              )}
            </div>
          )}
          <div className="p-6 -mt-8 relative">
            <h1 className="text-2xl font-bold text-white">{track.name}</h1>
            <p className="text-zinc-400 mt-1">{track.artist}</p>
            <p className="text-zinc-600 text-sm mt-0.5">{track.album}</p>
            {track.duration_ms && <p className="text-zinc-700 text-xs mt-0.5">{ms(track.duration_ms)}</p>}
            {track.spotify_url && (
              <a
                href={track.spotify_url}
                target="_blank"
                rel="noreferrer"
                className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold rounded-xl transition-colors text-sm"
              >
                ▶ Open on Spotify
              </a>
            )}
          </div>
        </div>
      </div>
    </Screen>
  )
}

// ── Search App ─────────────────────────────────────────────────────────────────
type Phase = 'idle' | 'searching' | 'results' | 'gifting' | 'done'

function SearchApp() {
  const [query, setQuery] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [tracks, setTracks] = useState<Track[]>([])
  const [picked, setPicked] = useState<Track | null>(null)
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

  async function gift(track: Track) {
    setPicked(track); setPhase('gifting')
    try {
      const r = await fetch('/api/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed to create gift')
      setGiftLink(d.gift_link)
      setPhase('done')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
      setPhase('results')
    }
  }

  function copy() {
    navigator.clipboard.writeText(giftLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function reset() {
    setPhase('idle'); setQuery(''); setTracks([]); setPicked(null); setError('')
  }

  return (
    <div className="min-h-screen bg-[#09090f] text-white relative overflow-x-hidden">
      {/* ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              giftyfi
            </span>
          </h1>
          <p className="text-zinc-500 text-sm">turn a song into a gift ✉️</p>
        </div>

        {/* Search bar */}
        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/60 transition-all text-sm"
            placeholder="Search a song name..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
          />
          <button
            onClick={search}
            disabled={phase === 'searching' || phase === 'gifting'}
            className="px-5 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-40 rounded-2xl font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-900/40 whitespace-nowrap"
          >
            {phase === 'searching' ? <Spin /> : 'Search'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-950/50 border border-red-800/40 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {phase === 'results' && (
          <div>
            <p className="text-zinc-600 text-xs mb-3 px-1">
              {tracks.length} result{tracks.length !== 1 ? 's' : ''} — pick one to gift:
            </p>
            <div className="space-y-2">
              {tracks.map((t, i) => (
                <button
                  key={i}
                  onClick={() => gift(t)}
                  className="w-full flex items-center gap-4 p-3.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-purple-500/30 rounded-2xl transition-all text-left group"
                >
                  {t.image_url
                    ? <img src={t.image_url} alt="" className="w-13 h-13 w-[52px] h-[52px] rounded-xl object-cover flex-shrink-0" />
                    : <div className="w-[52px] h-[52px] rounded-xl bg-zinc-800 flex items-center justify-center text-xl flex-shrink-0">♪</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{t.name}</p>
                    <p className="text-zinc-400 text-xs truncate mt-0.5">{t.artist}</p>
                    <p className="text-zinc-600 text-xs truncate mt-0.5">{t.album}</p>
                  </div>
                  <span className="text-purple-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pr-1 flex-shrink-0">
                    Gift →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gifting spinner */}
        {phase === 'gifting' && (
          <div className="flex items-center justify-center gap-3 py-8 text-zinc-500 text-sm">
            <Spin /> Creating gift link...
          </div>
        )}

        {/* Done */}
        {phase === 'done' && picked && (
          <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/[0.04]">
            {picked.image_url && (
              <div className="relative">
                <img src={picked.image_url} alt="" className="w-full object-cover max-h-64" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090f] via-[#09090f]/20 to-transparent" />
              </div>
            )}
            <div className="p-6 -mt-10 relative">
              <p className="font-bold text-xl text-white">{picked.name}</p>
              <p className="text-zinc-400 text-sm mt-0.5">{picked.artist}</p>
              <p className="text-zinc-600 text-xs mt-0.5 mb-5">{picked.album}</p>

              <div className="bg-purple-950/40 border border-purple-800/30 rounded-2xl p-4">
                <p className="text-purple-400 text-xs font-semibold uppercase tracking-widest mb-3">🎁 Gift Link</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={giftLink}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-zinc-400 min-w-0"
                  />
                  <button
                    onClick={copy}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${
                      copied ? 'bg-emerald-600' : 'bg-purple-600 hover:bg-purple-500 hover:-translate-y-0.5'
                    }`}
                  >
                    {copied ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>

              <button onClick={reset} className="mt-5 text-zinc-600 hover:text-zinc-400 text-xs transition-colors">
                ← Search another song
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function Spin() {
  return <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
}
function Loader() {
  return <Screen><Spin /></Screen>
}
function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090f] flex items-center justify-center p-4 text-white">
      {children}
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function App() {
  const code = giftCode()
  return code ? <GiftReveal code={code} /> : <SearchApp />
}
