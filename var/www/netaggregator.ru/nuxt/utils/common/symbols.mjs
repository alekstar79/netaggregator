let caps = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
    lower = Array.from('abcdefghijklmnopqrstuvwxyz'),
    numbers = Array.from('0123456789')

export function symbols(set = 'all')
{
    return set === 'all' ? Array.from([...caps,...lower,...numbers]) : Array.from({ caps, lower, numbers }[set])
}

export function rndstring(length = 7, signs = 'all')
{
    length || (length = 1)

    const base = symbols(signs)

    return Array.from({ length }, () => base[Math.random() * base.length | 0]).join('')
}
