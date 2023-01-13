export default function(req, res, next)
{
    console.log(`reqtime: ${req.requestTime}`)

    next()
}
