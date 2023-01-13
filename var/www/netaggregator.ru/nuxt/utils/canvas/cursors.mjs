const data = svg => `data:image/svg+xml;base64,${btoa(svg)}`

export function circleCursor(size, scale, color)
{
    size *= scale

    const url = svg => `url(${data(svg)}) ${size / 2} ${size / 2}`,
        circle = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size * 2} ${size * 2}" height="${size}" width="${size}">
            <circle fill="${color}" cx="${size}" cy="${size}" r="${size}" />
        </svg>`

    return `${url(circle)}, auto`
}

export function squareCursor(size, scale, color)
{
    size *= scale

    const url = svg => `url(${data(svg)}) ${size / 2} ${size / 2}`,
        square = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" height="${size}" width="${size}">
            <rect height="${size}" width="${size}" fill="${color}" />
        </svg>`

    return `${url(square)}, auto`
}

export function fillCursor(size = 24, scale = 1.5)
{
    size *= scale

    const url = svg => `url(${data(svg)}) 6 30`,
        square = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="${size}" width="${size}">
            <path fill="#fff" stroke="#000" stroke-width="1" d="M5 15.18C5 15.18 7 17.47 7 18.88C7 20.05 6.1 21 5 21C3.89 21 3 20.05 3 18.88C3 17.47 5 15.18 5 15.18M18.79 13.59L14 8.52L9.21 13.59M16.38 3L17.79 4.49L15.41 7.01C18.5 10.28 20.21 12.1 20.56 12.47C21.15 13.06 21.15 14.09 20.56 14.71C20.01 15.29 15.61 19.95 15.06 20.53C14.77 20.84 14.38 21 14 21C13.62 21 13.23 20.84 12.94 20.53C12.39 19.95 7.99 15.29 7.44 14.71C6.85 14.09 6.85 13.06 7.44 12.47C8.63 11.2 11.61 8.05 16.38 3Z" />
        </svg>`

    return `${url(square)}, auto`
}

export function pipetteCursor(size = 24)
{
    const url = svg => `url(${data(svg)}) 4 20`,
        square = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="${size}" width="${size}">
            <path fill="#fff" stroke="#000" stroke-width="1" d="M19.35,11.72L17.22,13.85L15.81,12.43L8.1,20.14L3.5,22L2,20.5L3.86,15.9L11.57,8.19L10.15,6.78L12.28,4.65L19.35,11.72M16.76,3C17.93,1.83 19.83,1.83 21,3C22.17,4.17 22.17,6.07 21,7.24L19.08,9.16L14.84,4.92L16.76,3M5.56,17.03L4.5,19.5L6.97,18.44L14.4,11L13,9.6L5.56,17.03Z" />
        </svg>`

    return `${url(square)}, auto`
}
