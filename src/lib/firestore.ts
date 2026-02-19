import { initializeApp, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

/**
 * Initialize Firebase Admin SDK (server-side only).
 *
 * Locally: uses Application Default Credentials via `gcloud auth application-default login`
 * Production: set GOOGLE_APPLICATION_CREDENTIALS env var to point to a service account JSON,
 *             or use a platform like Cloud Run / Vercel with Workload Identity.
 */
function getAdminApp() {
  if (getApps().length > 0) return getApps()[0]
  return initializeApp()
}

export const db = getFirestore(getAdminApp())
