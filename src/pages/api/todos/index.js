import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  if (req.method === 'GET') {
    const todos = await db.collection('todos').find({}).toArray();
    res.status(200).json(todos);
  } else if (req.method === 'POST') {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Task text is required' });
    }

    const result = await db.collection('todos').insertOne({ text });
    res.status(201).json(result);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}


