/**
* @see https://gist.github.com/damirm/18848ae9636abb524eb4
*/
export function shift(arr, direction, n)
{
    const times = n > arr.length ? n % arr.length : n

    return arr.concat(arr.splice(0, (direction > 0 ? arr.length - times : times)))
}
