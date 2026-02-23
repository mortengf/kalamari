import { google } from 'googleapis'
import dayjs from 'dayjs'

/**
 * Returns an authenticated Google Tasks client using the user's access token.
 */
export function getTasksClient(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return google.tasks({ version: 'v1', auth })
}

/**
 * Fetch all task lists for the authenticated user.
 */
export async function listTaskLists(accessToken: string) {
  const tasks = getTasksClient(accessToken)
  const res = await tasks.tasklists.list({ maxResults: 100 })
  return res.data.items ?? []
}

export interface TaskPart {
  title: string
  /** Offset in minutes relative to the anchor date (negative = before, positive = after) */
  offsetMinutes: number
  description?: string
}

/**
 * Creates multiple tasks from a list of TaskParts and an anchor date.
 * Returns the created task IDs.
 */
export async function createTasksFromParts(
  accessToken: string,
  taskListId: string,
  anchorDate: string, // ISO 8601
  parts: TaskPart[]
): Promise<string[]> {
  const tasks = getTasksClient(accessToken)
  const anchor = dayjs(anchorDate)
  const createdIds: string[] = []

  for (const part of parts) {
    const due = anchor.add(part.offsetMinutes, 'minute')

    const res = await tasks.tasks.insert({
      tasklist: taskListId,
      requestBody: {
        title: part.title,
        notes: part.description,
        // Google Tasks due date must be in RFC 3339 format with time set to 00:00:00Z
        due: due.toDate().toISOString().replace(/T.*/, 'T00:00:00.000Z'),
      },
    })

    if (res.data.id) createdIds.push(res.data.id)
  }

  return createdIds
}
