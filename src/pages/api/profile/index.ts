
import type { NextApiRequest, NextApiResponse } from 'next'
import { getProfilesByUserId, createProfile } from '../../../services/profileService'
import { isUserSubscribed } from '../../../services/userSubscribeService'
import { verifyJwt } from '../../../utils/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(' ')[1]
  const user = token ? verifyJwt(token) : null
  if (!user) return res.status(401).json({ message: 'Unauthorized' })

  if (req.method === 'GET') {
    // Get all profiles for user
    const profiles = await getProfilesByUserId(user.userId)
    return res.status(200).json(profiles)
  }

  if (req.method === 'POST') {
    // Create new profile for user
    const subscribed = await isUserSubscribed(user.userId)
    if (!subscribed) return res.status(403).json({ message: 'You must be a subscribed user to access profiles.' })

    const profile = req.body
    profile.userId = user.userId
    const created = await createProfile(profile)
    return res.status(200).json(created)
  }

  return res.status(405).end()
}
