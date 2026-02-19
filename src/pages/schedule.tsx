import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { Template } from '@/types'

interface Calendar {
  id: string
  summary: string
}

export default function SchedulePage() {
  const router = useRouter()
  const { templateId: preselected } = router.query

  const [templates, setTemplates] = useState<Template[]>([])
  const [calendars, setCalendars] = useState<Calendar[]>([])
  const [templateId, setTemplateId] = useState('')
  const [calendarId, setCalendarId] = useState('')
  const [anchorDate, setAnchorDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/templates').then(r => r.json()),
      fetch('/api/calendars').then(r => r.json()),
    ]).then(([tmpl, cals]) => {
      setTemplates(tmpl)
      setCalendars(cals)
      if (cals.length > 0) setCalendarId(cals[0].id)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (preselected && typeof preselected === 'string') setTemplateId(preselected)
  }, [preselected])

  const selectedTemplate = templates.find(t => t.id === templateId)

  async function schedule() {
    if (!templateId) { setError('Please select a template'); return }
    if (!calendarId) { setError('Please select a calendar'); return }
    if (!anchorDate) { setError('Please pick an anchor date'); return }
    setSaving(true)
    setError('')

    const res = await fetch('/api/event-groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId, calendarId, anchorDate }),
    })

    if (res.ok) {
      setDone(true)
    } else {
      setError('Something went wrong. Please try again.')
    }
    setSaving(false)
  }

  return (
    <>
      <Head><title>Schedule – Kalamari</title></Head>
      <Layout>
        <div className="max-w-xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
            <p className="text-stone-400 text-sm mt-1">
              Pick a template, set the anchor date, and create all events at once
            </p>
          </div>

          {done ? (
            <div className="bg-stone-900 border border-stone-700 rounded-xl p-8 text-center">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-stone-100 font-semibold mb-1">Events created!</p>
              <p className="text-stone-400 text-sm mb-6">
                All parts of <span className="text-amber-400">{selectedTemplate?.name}</span> have been added to your calendar.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => { setDone(false); setAnchorDate('') }}
                  className="px-4 py-2 bg-stone-800 text-stone-300 text-sm rounded-lg hover:bg-stone-700 transition-colors"
                >
                  Schedule another
                </button>
                <button
                  onClick={() => router.push('/templates')}
                  className="px-4 py-2 bg-amber-400 text-stone-950 text-sm font-semibold rounded-lg hover:bg-amber-300 transition-colors"
                >
                  Back to templates
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="text-stone-500 text-sm animate-pulse">Loading…</div>
          ) : (
            <div className="space-y-4">
              {/* Template picker */}
              <section className="bg-stone-900 border border-stone-800 rounded-xl p-6">
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-3">
                  Template
                </label>
                {templates.length === 0 ? (
                  <p className="text-stone-400 text-sm">
                    No templates yet.{' '}
                    <a href="/templates/new" className="text-amber-400 hover:underline">
                      Create one first →
                    </a>
                  </p>
                ) : (
                  <div className="space-y-2">
                    {templates.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTemplateId(t.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-colors flex items-center gap-3 ${
                          templateId === t.id
                            ? 'border-amber-400 bg-amber-400/10'
                            : 'border-stone-700 hover:border-stone-500'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                        <div>
                          <div className="text-sm font-medium text-stone-100">{t.name}</div>
                          <div className="text-xs text-stone-500">{t.parts.length} parts</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* Preview */}
              {selectedTemplate && (
                <section className="bg-stone-900 border border-stone-800 rounded-xl p-6">
                  <label className="block text-xs uppercase tracking-widest text-stone-500 mb-3">
                    Preview
                  </label>
                  <div className="space-y-2">
                    {selectedTemplate.parts.map((p, i) => (
                      <div key={p.id} className="flex items-center gap-3 text-sm">
                        <span className="text-stone-600 w-4 text-center text-xs">{i + 1}</span>
                        <span className="text-stone-200">{p.title}</span>
                        <span className="ml-auto text-xs text-stone-500">
                          {p.offsetMinutes === 0
                            ? 'anchor day'
                            : p.offsetMinutes > 0
                            ? `+${Math.round(p.offsetMinutes / 60 / 24)} days after`
                            : `${Math.abs(Math.round(p.offsetMinutes / 60 / 24))} days before`}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Anchor date */}
              <section className="bg-stone-900 border border-stone-800 rounded-xl p-6">
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-3">
                  Anchor date & time
                </label>
                <input
                  type="datetime-local"
                  value={anchorDate}
                  onChange={e => setAnchorDate(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                />
                <p className="text-xs text-stone-500 mt-2">
                  This is the date/time of the main event. All other parts are offset relative to this.
                </p>
              </section>

              {/* Calendar */}
              <section className="bg-stone-900 border border-stone-800 rounded-xl p-6">
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-3">
                  Calendar
                </label>
                <select
                  value={calendarId}
                  onChange={e => setCalendarId(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                >
                  {calendars.map(c => (
                    <option key={c.id} value={c.id}>{c.summary}</option>
                  ))}
                </select>
              </section>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                onClick={schedule}
                disabled={saving}
                className="w-full py-3 bg-amber-400 text-stone-950 font-semibold rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50"
              >
                {saving ? 'Creating events…' : 'Create all events in calendar →'}
              </button>
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
