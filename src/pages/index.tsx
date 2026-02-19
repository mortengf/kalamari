import { useSession, signIn, signOut } from 'next-auth/react'
import Head from 'next/head'

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-gray-50">
        <h1 className="text-3xl font-bold text-brand-700">🦑 Kalamari</h1>
        <p className="text-gray-500">Calendar event template manager</p>
        <button
          onClick={() => signIn('google')}
          className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Kalamari</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-brand-700">🦑 Kalamari</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{session.user?.email}</span>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a
              href="/templates"
              className="block p-6 bg-white rounded-xl border hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold mb-1">📋 Templates</h2>
              <p className="text-gray-500 text-sm">Create and manage your event templates</p>
            </a>
            <a
              href="/schedule"
              className="block p-6 bg-white rounded-xl border hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold mb-1">📅 Schedule</h2>
              <p className="text-gray-500 text-sm">Use a template to create events in your calendar</p>
            </a>
          </div>
        </main>
      </div>
    </>
  )
}
