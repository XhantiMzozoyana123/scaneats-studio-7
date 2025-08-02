
import type { NextApiRequest, NextApiResponse } from 'next'
import { getProfileById, updateProfile, deleteProfile } from '../../../services/profileService'
import { isUserSubscribed } from '../../../services/userSubscribeService'
import { verifyJwt } from '../../../utils/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(' ')[1]
  const user = token ? verifyJwt(token) : null
  if (!user) return res.status(401).json({ message: 'Unauthorized' })

  const id = parseInt(req.query.id as string, 10)

  if (req.method === 'GET') {
    const profile = await getProfileById(id, user.userId)
    if (!profile) return res.status(404).end()
    return res.status(200).json(profile)
  }

  if (req.method === 'PUT') {
    const subscribed = await isUserSubscribed(user.userId)
    if (!subscribed) return res.status(403).json({ message: 'You must be a subscribed user to access profiles.' })

    const updated = await updateProfile(id, user.userId, req.body)
    if (!updated) return res.status(404).end()
    return res.status(204).end()
  }

  if (req.method === 'DELETE') {
    const subscribed = await isUserSubscribed(user.userId)
    if (!subscribed) return res.status(403).json({ message: 'You must be a subscribed user to access profiles.' })

    const deleted = await deleteProfile(id, user.userId)
    if (!deleted) return res.status(404).end()
    return res.status(204).end()
  }

  return res.status(405).end()
}
