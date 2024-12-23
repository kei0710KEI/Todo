import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    switch (req.method) {
      case 'PUT': {
        const { text } = req.body;

        if (!text) {
          return res.status(400).json({ error: 'Task text is required' });
        }

        const result = await db.collection('todos').updateOne(
          { _id: new ObjectId(id) },
          { $set: { text } }
        );

        return res.status(200).json(result);
      }

      case 'DELETE': {
        const result = await db.collection('todos').deleteOne({ _id: new ObjectId(id) });
        return res.status(200).json(result);
      }

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
