import { google } from 'googleapis'
import dayjs from 'dayjs'

/**
 * Returns an authenticated Google Calendar client using the user's access token.
 */
export function getCalendarClient(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return google.calendar({ version: 'v3', auth })
}

/**
 * Fetch all calendars for the authenticated user.
 */
export async function listCalendars(accessToken: string) {
  const calendar = getCalendarClient(accessToken)
  const res = await calendar.calendarList.list()
  return res.data.items ?? []
}

export interface EventPart {
  title: string
  /** Offset in minutes relative to the anchor date (negative = before, positive = after) */
  offsetMinutes: number
  durationMinutes: number
  description?: string
}

/**
 * Creates multiple calendar events from a list of EventParts and an anchor date.
 * Returns the created event IDs.
 */
export async function createEventsFromParts(
  accessToken: string,
  calendarId: string,
  anchorDate: string, // ISO 8601
  parts: EventPart[]
): Promise<string[]> {
  const calendar = getCalendarClient(accessToken)
  const anchor = dayjs(anchorDate)
  const createdIds: string[] = []

  for (const part of parts) {
    const start = anchor.add(part.offsetMinutes, 'minute')
    const end = start.add(part.durationMinutes, 'minute')

    const res = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: part.title,
        description: part.description,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
      },
    })

    if (res.data.id) createdIds.push(res.data.id)
  }

  return createdIds
}
