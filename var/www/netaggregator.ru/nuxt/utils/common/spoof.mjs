/**
 * Replacement of unwanted words in the string.
 * @param {String} s
 * @param {Object} self
 * @return {String|*}
 */
export function spoof(s, self)
{
    return self.user?.id === 25520481 && typeof s === 'string' ? s.replace(/porn/i, 'Fun') : s
}
