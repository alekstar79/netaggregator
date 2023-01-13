import { MongoClient } from 'mongodb'

export class UploadStore
{
    static client = new MongoClient('mongodb://localhost:27017/')

    static response = []

    static database
    static gtokens

    static async connect()
    {
        try {

            await UploadStore.client.connect()

            UploadStore.database = UploadStore.client.db('app')
            UploadStore.gtokens = UploadStore.database.collection('gtokens')

            return true

        } catch (e) {
        }

        return false
    }

    static async close()
    {
        await UploadStore.client.close()
    }

    static async get(data)
    {
        data instanceof Promise && (data = await data)

        const raw = await UploadStore.gtokens
            .find({ group_id: { $in: data.map(x => x.gid) }, group_token: { $exists: true, $ne: null } })
            .toArray()

        return raw.reduce((acc, c) => {
            acc.push({
                access_token: c.group_token,
                stream: data.find(s => s.gid === c.group_id).stream,
                group_id: c.group_id
            })

            return acc

        }, [])
    }
}
