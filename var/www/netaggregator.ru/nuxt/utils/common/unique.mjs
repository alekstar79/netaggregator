export function unique(key)
{
    const seen = new Set()

    return key
        ? entity => !seen.has(entity[key]) && (seen.add(entity[key]))
        : entity => !seen.has(entity) && (seen.add(entity))
}
