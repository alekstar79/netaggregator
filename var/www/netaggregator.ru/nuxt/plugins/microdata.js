/**
* Plugin for adding schema.org microdata tags to your markup
* Author: Jonas Schwendener <jonas.schwendener@gmail.com>
* @see https://github.com/jschwendener/vue-schema-microdata
*/

import microdata from '~/directives/microdata'

export default {
    install(Vue)
    {
        Vue.directive('schema', microdata)
    }
}
