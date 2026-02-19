import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { TemplatePart } from '@/types'
import { v4 as uuidv4 } from 'uuid'

const COLORS = [
  '#f59e0b', '#ef4444', '#3b82f6', '#10b981',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
]

const OFFSET_PRESETS = [
  { label: '−7 days', value: -7 * 24 * 60 },
  { label: '−3 days', value: -3 * 24 * 60 },
  { label: '−1 day',  value: -1 * 24 * 60 },
  { label: 'Anchor',  value: 0 },
  { label: '+1 day',  value: 1 * 24 * 60 },
  { label: '+3 days', value: 3 * 24 * 60 },
  { label: '+7 days', value: 7 * 24 * 60 },
]

function emptyPart(): TemplatePart {
  return { id: uuidv4(), title: '', offsetMinutes: 0, durationMinutes: 60 }
}

export default function NewTemplatePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [parts, setParts] = useState<TemplatePart[]>([emptyPart()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updatePart(id: string, patch: Partial<TemplatePart>) {
    setParts(ps => ps.map(p => p.id === id ? { ...p, ...patch } : p))
  }

  function removePart(id: string) {
    setParts(ps => ps.filter(p => p.id !== id))
  }

  function movePart(id: string, dir: -1 | 1) {
    setParts(ps => {
      const idx = ps.findIndex(p => p.id === id)
      if (idx + dir < 0 || idx + dir >= ps.length) return ps
      const next = [...ps]
      ;[next[idx], next[idx + dir]] = [next[idx + dir], next[idx]]
      return next
    })
  }

  async function save() {
    if (!name.trim()) { setError('Name is required'); return }
    if (parts.some(p => !p.title.trim())) { setError('All parts need a title'); return }
    setSaving(true)
    setError('')
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, color, parts }),
    })
    if (res.ok) {
      router.push('/templates')
    } else {
      setError('Failed to save. Please try again.')
      setSaving(false)
    }
  }

  return (
    <>
      <Head><title>New Template – Kalamari</title></Head>
      <Layout>
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => router.back()}
              className="text-stone-500 hover:text-stone-300 transition-colors text-sm"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold tracking-tight">New Template</h1>
          </div>

          {/* Basic info */}
          <section className="bg-stone-900 border border-stone-800 rounded-xl p-6 mb-4">
            <h2 className="text-xs uppercase tracking-widest text-stone-500 mb-4">Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-stone-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Squash, Haircut, Concert…"
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm text-stone-300 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Optional short description"
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm text-stone-300 mb-2">Color</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-stone-900' : 'hover:scale-110'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Parts */}
          <section className="bg-stone-900 border border-stone-800 rounded-xl p-6 mb-4">
            <h2 className="text-xs uppercase tracking-widest text-stone-500 mb-4">Event Parts</h2>
            <div className="space-y-3">
              {parts.map((part, idx) => (
                <div
                  key={part.id}
                  className="bg-stone-800 border border-stone-700 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-stone-500 w-5 text-center">{idx + 1}</span>
                    <input
                      type="text"
                      value={part.title}
                      onChange={e => updatePart(part.id, { title: e.target.value })}
                      placeholder="Event title, e.g. Book!"
                      className="flex-1 bg-stone-700 border border-stone-600 rounded-md px-3 py-1.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                    />
                    <div className="flex gap-1">
                      <button onClick={() => movePart(part.id, -1)} disabled={idx === 0} className="text-stone-600 hover:text-stone-300 disabled:opacity-20 text-xs px-1">↑</button>
                      <button onClick={() => movePart(part.id, 1)} disabled={idx === parts.length - 1} className="text-stone-600 hover:text-stone-300 disabled:opacity-20 text-xs px-1">↓</button>
                      <button onClick={() => removePart(part.id)} disabled={parts.length === 1} className="text-red-600 hover:text-red-400 disabled:opacity-20 text-xs px-1">✕</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pl-7">
                    <div>
                      <label className="block text-xs text-stone-500 mb-1">Offset from anchor</label>
                      <select
                        value={part.offsetMinutes}
                        onChange={e => updatePart(part.id, { offsetMinutes: Number(e.target.value) })}
                        className="w-full bg-stone-700 border border-stone-600 rounded-md px-2 py-1.5 text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                      >
                        {OFFSET_PRESETS.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-stone-500 mb-1">Duration (min)</label>
                      <input
                        type="number"
                        value={part.durationMinutes}
                        onChange={e => updatePart(part.id, { durationMinutes: Number(e.target.value) })}
                        min={5}
                        step={5}
                        className="w-full bg-stone-700 border border-stone-600 rounded-md px-2 py-1.5 text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                  <div className="pl-7 mt-2">
                    <input
                      type="text"
                      value={part.description ?? ''}
                      onChange={e => updatePart(part.id, { description: e.target.value })}
                      placeholder="Notes / description (optional)"
                      className="w-full bg-stone-700 border border-stone-600 rounded-md px-3 py-1.5 text-xs text-stone-300 placeholder-stone-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setParts(ps => [...ps, emptyPart()])}
              className="mt-3 text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              + Add part
            </button>
          </section>

          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

          <button
            onClick={save}
            disabled={saving}
            className="w-full py-3 bg-amber-400 text-stone-950 font-semibold rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save template'}
          </button>
        </div>
      </Layout>
    </>
  )
}
