/**
* Directive for adding schema.org microdata tags to your markup
* Author: Jonas Schwendener <jonas.schwendener@gmail.com>
* @see https://github.com/jschwendener/vue-schema-microdata
*/

const schemaUrl = 'https://schema.org/'

function bind(el, bindings)
{
    if (bindings.arg === 'scope') {
        el.setAttribute('itemscope', '')
    }
    if (!bindings.value) {
        return
    }

    const schema = bindings.value

    Object.keys(schema).forEach(key => {
        if (key === 'scope') {
            el.setAttribute('itemscope', '')
        } else if (key === 'type') {
            el.setAttribute('itemtype', schemaUrl + schema[key])
        } else if (key === 'prop') {
            el.setAttribute('itemprop', schema[key])
        } else {
            el.setAttribute(key, schema[key])
        }
    })
}

export default {
    bind
}
