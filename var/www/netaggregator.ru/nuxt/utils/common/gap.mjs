export function gap(n, sep = ' ')
{
    const parts = n.toString().split('.')

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, sep)

    return parts.join('.')
}
