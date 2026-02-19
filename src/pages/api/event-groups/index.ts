import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/firestore'
import { createEventsFromParts } from '@/lib/googleCalendar'
import { Template, EventGroup } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email || !session.accessToken)
    return res.status(401).json({ error: 'Unauthorized' })

  const userId = session.user.email
  const accessToken = session.accessToken as string

  if (req.method === 'GET') {
    const snap = await db
      .collection('eventGroups')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get()
    return res.status(200).json(snap.docs.map(d => d.data() as EventGroup))
  }

  if (req.method === 'POST') {
    const { templateId, anchorDate, calendarId } = req.body as {
      templateId: string
      anchorDate: string
      calendarId: string
    }

    // Load template
    const tDoc = await db.collection('templates').doc(templateId).get()
    if (!tDoc.exists) return res.status(404).json({ error: 'Template not found' })
    const template = tDoc.data() as Template

    // Create all events in Google Calendar
    const eventIds = await createEventsFromParts(
      accessToken,
      calendarId,
      anchorDate,
      template.parts.map(p => ({
        title: p.title,
        offsetMinutes: p.offsetMinutes,
        durationMinutes: p.durationMinutes,
        description: p.description,
      }))
    )

    const group: EventGroup = {
      id: uuidv4(),
      userId,
      templateId,
      templateName: template.name,
      anchorDate,
      calendarId,
      eventIds,
      createdAt: new Date().toISOString(),
    }

    await db.collection('eventGroups').doc(group.id).set(group)
    return res.status(201).json(group)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
