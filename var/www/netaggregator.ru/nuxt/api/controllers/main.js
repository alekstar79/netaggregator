const servers = [
    { id: 1, name: 'AWS',          status: 'working' },
    { id: 3, name: 'Google Cloud', status: 'working' },
    { id: 5, name: 'Yandex Cloud', status: 'working' },
    { id: 7, name: 'Microsoft',    status: 'pending' }
]

/**
 * @type {Function}
 * @param req
 * @param res
 */
export default function main(req, res)
{
    res.status(200).json(servers)
}
