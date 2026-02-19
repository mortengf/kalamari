import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { Template } from '@/types'

const COLORS = [
  '#f59e0b', '#ef4444', '#3b82f6', '#10b981',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
]

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/templates')
      .then(r => r.json())
      .then(data => { setTemplates(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function deleteTemplate(id: string) {
    if (!confirm('Delete this template?')) return
    await fetch(`/api/templates/${id}`, { method: 'DELETE' })
    setTemplates(t => t.filter(x => x.id !== id))
  }

  return (
    <>
      <Head><title>Templates – Kalamari</title></Head>
      <Layout>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
            <p className="text-stone-400 text-sm mt-1">
              Define reusable multi-part event patterns
            </p>
          </div>
          <button
            onClick={() => router.push('/templates/new')}
            className="px-4 py-2 bg-amber-400 text-stone-950 text-sm font-semibold rounded-lg hover:bg-amber-300 transition-colors"
          >
            + New template
          </button>
        </div>

        {loading ? (
          <div className="text-stone-500 text-sm animate-pulse">Loading templates…</div>
        ) : templates.length === 0 ? (
          <div className="border border-dashed border-stone-700 rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-stone-400 text-sm">No templates yet.</p>
            <button
              onClick={() => router.push('/templates/new')}
              className="mt-4 text-amber-400 text-sm hover:underline"
            >
              Create your first template →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(t => (
              <div
                key={t.id}
                className="bg-stone-900 border border-stone-800 rounded-xl p-5 hover:border-stone-600 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: t.color }}
                    />
                    <h2 className="font-semibold text-stone-100">{t.name}</h2>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => router.push(`/templates/${t.id}`)}
                      className="text-xs text-stone-400 hover:text-stone-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTemplate(t.id)}
                      className="text-xs text-red-500 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {t.description && (
                  <p className="text-stone-400 text-sm mb-3">{t.description}</p>
                )}
                <div className="space-y-1">
                  {t.parts.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-2 text-xs text-stone-500">
                      <span className="w-4 text-center text-stone-600">{i + 1}</span>
                      <span className="text-stone-300">{p.title}</span>
                      <span className="ml-auto">
                        {p.offsetMinutes === 0
                          ? 'anchor'
                          : p.offsetMinutes > 0
                          ? `+${Math.round(p.offsetMinutes / 60 / 24)}d`
                          : `${Math.round(p.offsetMinutes / 60 / 24)}d`}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between">
                  <span className="text-xs text-stone-600">
                    {t.parts.length} part{t.parts.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => router.push(`/schedule?templateId=${t.id}`)}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Use template →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Layout>
    </>
  )
}
