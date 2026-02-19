import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/firestore'
import { Template } from '@/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email) return res.status(401).json({ error: 'Unauthorized' })

  const userId = session.user.email
  const { id } = req.query as { id: string }
  const ref = db.collection('templates').doc(id)
  const doc = await ref.get()

  if (!doc.exists) return res.status(404).json({ error: 'Not found' })
  const template = doc.data() as Template
  if (template.userId !== userId) return res.status(403).json({ error: 'Forbidden' })

  if (req.method === 'GET') {
    return res.status(200).json(template)
  }

  if (req.method === 'PUT') {
    const updated: Template = {
      ...template,
      ...req.body,
      id,
      userId,
      updatedAt: new Date().toISOString(),
    }
    await ref.set(updated)
    return res.status(200).json(updated)
  }

  if (req.method === 'DELETE') {
    await ref.delete()
    return res.status(204).end()
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
