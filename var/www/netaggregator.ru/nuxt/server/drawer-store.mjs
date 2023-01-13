import { MongoClient } from 'mongodb'

export class DrawerStore
{
    static client = new MongoClient('mongodb://localhost:27017/')

    static response = []

    static database
    static dcover
    static xcover

    static get length()
    {
        return DrawerStore.response.length
    }

    static async connect()
    {
        try {

            await DrawerStore.client.connect()

            DrawerStore.database = DrawerStore.client.db('app')
            DrawerStore.dcover = DrawerStore.database.collection('dcover')
            DrawerStore.xcover = DrawerStore.database.collection('xcover')

            return true

        } catch (e) {
        }

        return false
    }

    static async close()
    {
        await DrawerStore.client.close()
    }

    /**
    * @see https://stackoverflow.com/a/221297/6399083
    * @UTC (Date.now() / 1000 | 0) % (3600 * 24)
    */
    static secondsToday()
    {
        const d = new Date()

        return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()
    }

    static chooseCover({ timerange, xcovers = [] })
    {
        let now, hash, cover = xcovers[0]

        if (xcovers.length < 2) return cover

        if (timerange && timerange.length >= 2) {
            now = DrawerStore.secondsToday()

            if ((hash = timerange.find(r => {
                switch (true) {
                    case r.from < r.to:
                        return now >= r.from && now <= r.to
                    case r.from > r.to:
                        return now >= r.from || now <= r.to
                }

                return false
            })))
            {
                cover = xcovers.find(({ _id }) =>  _id === hash._id)
            }
        }

        return cover
    }

    static checkSubscribe({ subscribe }, { _id, manual }, now)
    {
        return manual || subscribe?.cover && subscribe.cover[_id] && subscribe.cover[_id] > now
    }

    static async get()
    {
        let xcovers = [], dcovers = []

        try {

            xcovers = await DrawerStore.xcover.aggregate([
                { $lookup: { from: 'yandex', localField: 'weather.geoid', foreignField: 'city.geoid', as: 'weather' } },
                { $lookup: { from: 'traffic', localField: 'traffic.code', foreignField: 'code', as: 'traffic' } },
                { $lookup: { from: 'subscribe', localField: 'uid', foreignField: 'uid', as: 'subscribe' } },
                {
                    $project: {
                        _id: { $toString: '$_id' },
                        uid: 1,
                        subscribe: {
                            $cond: {
                                if: { $and: [{ $ifNull: [ '$subscribe', false ] }, { $gte: [{ $size: '$subscribe' }, 1 ] }] },
                                then: { $arrayElemAt: [ '$subscribe', 0 ] },
                                else: null
                            }
                        },
                        traffic: {
                            $cond: {
                                if: { $and: [{ $ifNull: [ '$traffic', false ] }, { $gte: [{ $size: '$traffic' }, 1 ] }] },
                                then: { $arrayElemAt: [ '$traffic', 0 ] },
                                else: null
                            }
                        },
                        weather: {
                            $cond: {
                                if: { $and: [{ $ifNull: [ '$weather', false ] }, { $gte: [{ $size: '$weather' }, 1 ] }] },
                                then: { $arrayElemAt: [ '$weather', 0 ] },
                                else: null
                            }
                        }
                    }
                },
                {
                    $unset: ['subscribe.uid','subscribe._id','traffic._id','weather._id']
                }
            ]).toArray()

            /**
            * @see https://stackoverflow.com/questions/51642472/in-requires-an-array-as-a-second-argument-found-missing
            */
            dcovers = await DrawerStore.dcover.aggregate([
                { $match: { $or: [{ changed: true }, { time: true }, { manual: true }] } },
                {
                    $lookup: {
                        from: 'xcover',
                        let: { group_id: '$_id' },
                        pipeline: [
                            {
                                $addFields: {
                                    connections: {
                                        $cond: {
                                            if: {
                                                $ne: [{ $type: '$connections' }, 'array']
                                            },
                                            then: [],
                                            else: '$connections'
                                        }
                                    }
                                }
                            },
                            { $match: { $expr: { $in: [ '$$group_id', '$connections' ] }}},
                            { $project: { _id: { $toString: '$_id' } } }
                        ],
                        as: 'xcovers'
                    }
                }
            ]).toArray()

        } catch (e) {
        }

        await DrawerStore.dcover.updateMany(
            {
                $or: [
                    { manual: true },
                    {
                        $and: [
                            { changed: true },
                            { birthday: { $exists: false } }
                        ]
                    }
                ]
            },
            {
                $set: { changed: false },
                $unset: { manual: '' }
            }
        )

        let c, x, data = [], now = (Date.now() / 1000 | 0)

        for (const dcover of dcovers) {
            if (!(c = DrawerStore.chooseCover(dcover))) continue

            x = xcovers.find(({ _id }) =>  _id === c._id)

            if (DrawerStore.checkSubscribe(x, dcover, now)) data.push({
                ...dcover,
                src: `nuxt/static/dcover/${x.uid}/${x._id}/struct.wxg`,
                subscribe: x.subscribe.cover[dcover._id],
                designer: x.subscribe.designer,
                weather: x.weather,
                traffic: x.traffic
            })
        }

        DrawerStore.response = data

        return DrawerStore.response
    }
}
