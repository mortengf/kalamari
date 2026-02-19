import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { listCalendars } from '@/lib/googleCalendar'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email || !session.accessToken)
    return res.status(401).json({ error: 'Unauthorized' })

  const calendars = await listCalendars(session.accessToken as string)
  return res.status(200).json(calendars)
}
