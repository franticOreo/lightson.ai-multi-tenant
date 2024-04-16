import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Here you can handle the deauthorization logic, such as logging the event or cleaning up user data
  console.log('User deauthorized the app:', req.body);
  res.status(200).json({ message: 'Deauthorization received' });
}