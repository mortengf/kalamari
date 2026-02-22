import { initializeApp, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

/**
 * Initialize Firebase Admin SDK (server-side only).
 *
 * Uses Application Default Credentials (via `gcloud auth application-default login`).
 * The project is set explicitly via NEXT_PUBLIC_FIREBASE_PROJECT_ID to avoid
 * accidentally connecting to the wrong gcloud project.
 */
function getAdminApp() {
  if (getApps().length > 0) return getApps()[0]

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  if (!projectId) throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set in .env.local')

  return initializeApp({ projectId })
}

export const db = getFirestore(getAdminApp())
