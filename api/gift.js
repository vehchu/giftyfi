import { db } from './_lib/firebase.js'
import { toBase62 } from './_lib/base62.js'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { track, recipient, sender, message } = req.body ?? {}
    if (!track?.name) return res.status(400).json({ error: 'Track required' })

    // Atomic increment → unique base62 shortcode
    const counterRef = db.collection('_meta').doc('counter')
    let shortcode

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(counterRef)
      let current = snap.exists ? snap.data().value : 0
      if (current < 100000000000) current = 100000000000
      const next = current + 1
      tx.set(counterRef, { value: next })
      shortcode = toBase62(next)
    })

    await db.collection('gifts').doc(shortcode).set({
      ...track,
      recipient: recipient?.substring(0, 50) || null,
      sender: sender?.substring(0, 50) || null,
      message: message?.substring(0, 100) || null,
      created_at: new Date().toISOString(),
    })

    const protocol = req.headers['x-forwarded-proto'] || (req.headers.host.includes('localhost') ? 'http' : 'https')
    const baseUrl = `${protocol}://${req.headers.host}`
    return res.status(200).json({
      gift_link: `${baseUrl}/gift/${shortcode}`,
      link_id: shortcode,
    })
  } catch (err) {
    console.error('/api/gift error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
