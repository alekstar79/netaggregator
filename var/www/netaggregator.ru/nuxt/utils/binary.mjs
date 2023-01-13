/**
* @see https://stackoverflow.com/a/51829371/6399083
* @see https://stackoverflow.com/a/28755126/6399083
*/

Object.defineProperty(Array.prototype, 'binarySearch', {
    value(target, comparator) {
        let l = 0,
            h = this.length - 1,
            m, comparison

        /* default comparison method if one was not provided */
        comparator = comparator || function(a, b) {
            return (a < b ? -1 : (a > b ? 1 : 0))
        }

        while (l <= h) {
            m = (l + h) >>> 1 /* equivalent to Math.floor((l + h) / 2) but faster */

            comparison = comparator(this[m], target)

            if (comparison < 0) {
                l = m + 1
            } else if (comparison > 0) {
                h = m - 1
            } else {
                return m
            }
        }

        return ~l
    }
})

/**
* @param target: the object to insert into the array
* @param duplicate: (optional) whether to insert the object into the array even if a matching object already exists in the array (false by default)
* @param comparator: (optional) a method for comparing the target object type
* @return value: the index where the object was inserted into the array, or the index of a matching object in the array if a match was found and the duplicate parameter was false
*/
Object.defineProperty(Array.prototype, 'binaryInsert', {
    value(target, duplicate, comparator) {
        let i = this.binarySearch(target, comparator)

        if (i >= 0) { /* if the binarySearch return value was zero or positive, a matching object was found */
            if (!duplicate) {
                return i
            }
        } else { /* if the return value was negative, the bitwise complement of the return value is the correct index for this object */
            i = ~i
        }

        this.splice(i, 0, target)

        return i
    }
})

Object.defineProperty(Array.prototype, 'binaryDelete', {
    value(target, duplicate, comparator) {
        let i = this.binarySearch(target, comparator)

        if (i >= 0) { /* if the binarySearch return value was zero or positive, a matching object was found */
            this.slice(i, 1)
        }

        return i
    }
})
