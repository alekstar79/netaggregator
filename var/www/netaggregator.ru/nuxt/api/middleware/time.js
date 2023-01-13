function getTime(supported = true)
{
    const options = { hour: 'numeric', minute: 'numeric', second: 'numeric' },
        date = new Date()

    return supported
        ? date.toLocaleTimeString([], options)
        : date.toLocaleTimeString()
}

export default function(req, res, next)
{
    req.requestTime = getTime()

    next()
}
