import colors from 'vuetify/es5/util/colors'
import custom from '~/plugins/theme'

export default function(/* { app } */)
{
    return {
        breakpoint: {},
        icons: {},
        /* lang: {
            t: (key, ...params) => app.i18n.t(key, params)
        }, */
        rtl: false,
        theme: {
            dark: false,
            themes: {
                light: custom,
                dark: {
                    primary: colors.blue.darken2,
                    accent: colors.grey.darken3,
                    secondary: colors.amber.darken3,
                    info: colors.teal.lighten1,
                    warning: colors.amber.base,
                    error: colors.deepOrange.accent4,
                    success: colors.green.accent3
                }
            }
        }
    }
}
