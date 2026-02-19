import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

/**
 * Initialize Firebase Admin SDK (server-side only).
 * FIREBASE_ADMIN_CREDENTIALS should be a base64-encoded service account JSON.
 */
function getAdminApp() {
  if (getApps().length > 0) return getApps()[0]

  const credentials = JSON.parse(
    Buffer.from(process.env.FIREBASE_ADMIN_CREDENTIALS!, 'base64').toString('utf8')
  )

  return initializeApp({
    credential: cert(credentials),
  })
}

export const db = getFirestore(getAdminApp())
