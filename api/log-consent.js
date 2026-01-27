// api/log-consent.js
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        await client.connect();
        const database = client.db(); // ชื่อ DB เดิมของคุณ
        
        // แยกตู้เก็บ: ถ้าเป็นเรื่องคุกกี้เก็บใน 'consents' ถ้าเป็นเรื่องค้นหาเก็บใน 'search_logs'
        const collectionName = req.body.type === 'search' ? 'search_logs' : 'consents';
        const collection = database.collection(collectionName);

        const dataToSave = {
            ...req.body,
            ip: req.headers['x-forwarded-for'] || 'unknown',
            timestamp: new Date()
        };

        await collection.insertOne(dataToSave);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
