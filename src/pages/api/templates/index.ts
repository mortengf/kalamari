import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/firestore'
import { Template } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email) return res.status(401).json({ error: 'Unauthorized' })

  const userId = session.user.email
  const col = db.collection('templates')

  if (req.method === 'GET') {
    const snap = await col.where('userId', '==', userId).orderBy('createdAt', 'desc').get()
    const templates = snap.docs.map(d => d.data() as Template)
    return res.status(200).json(templates)
  }

  if (req.method === 'POST') {
    const now = new Date().toISOString()
    const template: Template = {
      ...req.body,
      id: uuidv4(),
      userId,
      createdAt: now,
      updatedAt: now,
    }
    await col.doc(template.id).set(template)
    return res.status(201).json(template)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
