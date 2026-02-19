import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') signIn('google')
  }, [status])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-950">
        <div className="text-stone-400 text-sm tracking-widest uppercase animate-pulse">Loading…</div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="border-b border-stone-800 px-8 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🦑</span>
          <span className="font-bold tracking-tight text-stone-100 group-hover:text-amber-400 transition-colors">
            Kalamari
          </span>
        </a>
        <nav className="flex items-center gap-6">
          <a
            href="/templates"
            className={`text-sm tracking-wide transition-colors ${
              router.pathname.startsWith('/templates')
                ? 'text-amber-400'
                : 'text-stone-400 hover:text-stone-100'
            }`}
          >
            Templates
          </a>
          <a
            href="/schedule"
            className={`text-sm tracking-wide transition-colors ${
              router.pathname === '/schedule'
                ? 'text-amber-400'
                : 'text-stone-400 hover:text-stone-100'
            }`}
          >
            Schedule
          </a>
          <span className="text-stone-600 text-sm">{session.user?.email}</span>
        </nav>
      </header>
      <main className="max-w-5xl mx-auto px-8 py-10">{children}</main>
    </div>
  )
}
