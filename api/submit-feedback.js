const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('legal_analytics');
    const collection = db.collection('feedbacks'); // แยกไปเก็บอีกตารางหนึ่ง

    const { message, timestamp } = req.body;
    await collection.insertOne({ message, timestamp: new Date() });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
};
