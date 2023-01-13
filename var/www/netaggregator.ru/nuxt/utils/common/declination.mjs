/**
* @example declination(5, ['комментарий','комментария','комментариев'])
* @param {Number} n The number for which the ending will be calculated
* @param {Array} titles Word variants for 1,2,5
* @returns {String}
*/
export function declination(n, titles)
{
    return titles[(n % 10 === 1 && n % 100 !== 11) ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2]
}
