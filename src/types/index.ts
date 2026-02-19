/**
 * A single part of a multi-part event template.
 */
export interface TemplatePart {
  id: string
  title: string
  /** Offset in minutes relative to the anchor date. Negative = before anchor. */
  offsetMinutes: number
  durationMinutes: number
  description?: string
}

/**
 * A named template that produces multiple calendar events.
 */
export interface Template {
  id: string
  userId: string
  name: string
  description?: string
  /** Hex color for visual identification */
  color: string
  /** Google Calendar ID to create events in */
  defaultCalendarId?: string
  parts: TemplatePart[]
  createdAt: string
  updatedAt: string
}

/**
 * A concrete instantiation of a template – a group of created events.
 */
export interface EventGroup {
  id: string
  userId: string
  templateId: string
  templateName: string
  /** ISO 8601 anchor date/time chosen by user */
  anchorDate: string
  calendarId: string
  /** Google Calendar event IDs created from this group */
  eventIds: string[]
  createdAt: string
}
