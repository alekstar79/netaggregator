export const icons = new Set()

export const weather = {
    200: { label: 'thunderstorm with light rain', icon: 'storm-showers' },
    201: { label: 'thunderstorm with rain', icon: 'storm-showers' },
    202: { label: 'thunderstorm with heavy rain', icon: 'storm-showers' },
    210: { label: 'light thunderstorm', icon: 'storm-showers' },
    211: { label: 'thunderstorm', icon: 'thunderstorm' },
    212: { label: 'heavy thunderstorm', icon: 'thunderstorm' },
    221: { label: 'ragged thunderstorm', icon: 'thunderstorm' },
    230: { label: 'thunderstorm with light drizzle', icon: 'storm-showers' },
    231: { label: 'thunderstorm with drizzle', icon: 'storm-showers' },
    232: { label: 'thunderstorm with heavy drizzle', icon: 'storm-showers' },
    300: { label: 'light intensity drizzle', icon: 'sprinkle' },
    301: { label: 'drizzle', icon: 'sprinkle' },
    302: { label: 'heavy intensity drizzle', icon: 'sprinkle' },
    310: { label: 'light intensity drizzle rain', icon: 'sprinkle' },
    311: { label: 'drizzle rain', icon: 'sprinkle' },
    312: { label: 'heavy intensity drizzle rain',icon: 'sprinkle' },
    313: { label: 'shower rain and drizzle', icon: 'sprinkle' },
    314: { label: 'heavy shower rain and drizzle', icon: 'sprinkle' },
    321: { label: 'shower drizzle', icon: 'sprinkle' },
    500: { label: 'light rain', icon: 'rain' },
    501: { label: 'moderate rain', icon: 'rain' },
    502: { label: 'heavy intensity rain', icon: 'rain' },
    503: { label: 'very heavy rain', icon: 'rain' },
    504: { label: 'extreme rain', icon: 'rain' },
    511: { label: 'freezing rain', icon: 'rain-mix' },
    520: { label: 'light intensity shower rain', icon: 'showers' },
    521: { label: 'shower rain', icon: 'showers' },
    522: { label: 'heavy intensity shower rain', icon: 'showers' },
    531: { label: 'ragged shower rain', icon: 'showers' },
    600: { label: 'light snow', icon: 'snow' },
    601: { label: 'snow', icon: 'snow' },
    602: { label: 'heavy snow', icon: 'snow' },
    611: { label: 'sleet', icon: 'sleet' },
    612: { label: 'shower sleet', icon: 'sleet' },
    615: { label: 'light rain and snow', icon: 'rain-mix' },
    616: { label: 'rain and snow', icon: 'rain-mix' },
    620: { label: 'light shower snow', icon: 'rain-mix' },
    621: { label: 'shower snow', icon: 'rain-mix' },
    622: { label: 'heavy shower snow', icon: 'rain-mix' },
    701: { label: 'mist', icon: 'sprinkle' },
    711: { label: 'smoke',icon: 'smoke' },
    721: { label: 'haze', icon: 'haze' },
    731: { label: 'sand, dust whirls', icon: 'cloudy-gusts' },
    741: { label: 'fog', icon: 'fog' },
    751: { label: 'sand', icon: 'cloudy-gusts' },
    761: { label: 'dust', icon: 'dust' },
    762: { label: 'volcanic ash', icon: 'smog' },
    771: { label: 'squalls', icon: 'dwindy' },
    781: { label: 'tornado', icon: 'tornado' },
    791: { label: 'night clear', icon: 'clear' },
    792: { label: 'night cloudy', icon: 'alt-cloudy' },
    793: { label: 'night showers', icon: 'alt-showers' },
    794: { label: 'night sleet', icon: 'alt-sleet' },
    795: { label: 'night rain', icon: 'alt-rain' },
    796: { label: 'day snow', icon: 'alt-snow' },
    797: { label: 'windy', icon: 'windy' },
    800: { label: 'clear sky', icon: 'sunny' },
    801: { label: 'few clouds', icon: 'cloudy' },
    802: { label: 'scattered clouds', icon: 'cloudy' },
    803: { label: 'broken clouds', icon: 'cloudy' },
    804: { label: 'overcast clouds', icon: 'cloudy' },
    900: { label: 'tornado', icon: 'tornado' },
    901: { label: 'tropical storm',icon: 'hurricane' },
    902: { label: 'hurricane', icon: 'hurricane' },
    903: { label: 'cold', icon: 'snowflake-cold' },
    904: { label: 'hot', icon: 'hot' },
    905: { label: 'windy', icon: 'nwindy' },
    906: { label: 'hail', icon: 'hail' },
    951: { label: 'calm', icon: 'sunny' },
    952: { label: 'light breeze', icon: 'cloudy-gusts' },
    953: { label: 'gentle breeze', icon: 'cloudy-gusts' },
    954: { label: 'moderate breeze', icon: 'cloudy-gusts' },
    955: { label: 'fresh breeze', icon: 'cloudy-gusts' },
    956: { label: 'strong breeze', icon: 'cloudy-gusts' },
    957: { label: 'high wind, near gale', icon: 'cloudy-gusts' },
    958: { label: 'gale', icon: 'cloudy-gusts' },
    959: { label: 'severe gale', icon: 'cloudy-gusts' },
    960: { label: 'storm', icon: 'thunderstorm' },
    961: { label: 'violent storm', icon: 'thunderstorm' },
    962: { label: 'hurricane', icon: 'cloudy-gusts' }
}

export const map = Object.keys(weather).reduce((acc, code) => {
    const entry = { day: `wi-day-${weather[code].icon}`, night: `wi-night-${weather[code].icon}`, icon: `wi-${weather[code].icon}` }

    if (!icons.has(entry.day)) {
        icons.add(entry.day)
    }
    if (!icons.has(entry.night)) {
        icons.add(entry.night)
    }
    if (!icons.has(entry.icon)) {
        icons.add(entry.icon)
    }

    return { ...acc, [code]: entry }

}, {})

export const yaIcons = {
    'bkn_d'    : 'wi-day-cloudy',           // переменная облачность (день)
    'bkn_n'    : 'wi-night-alt-cloudy',     // переменная облачность (ночь)
    // ----------------------------------------------------------------------------------------------
    'bkn_+ra_d': 'wi-day-showers',          // облачно, ливень (день)
    'bkn_-ra_d': 'wi-day-sleet',            // облачно с прояснениями, небольшой дождь (день)
    'bkn_ra_d' : 'wi-day-rain',             // переменная облачность, дождь (день)
    // ----------------------------------------------------------------------------------------------
    'bkn_+ra_n': 'wi-night-alt-showers',    // облачно, ливень (ночь)
    'bkn_-ra_n': 'wi-night-alt-sleet',      // облачно с прояснениями, небольшой дождь (ночь)
    'bkn_ra_n' : 'wi-night-alt-rain',       // переменная облачность, дождь (ночь)
    // ----------------------------------------------------------------------------------------------
    'bkn_+sn_d': 'wi-day-snow',             // облачно, снегопад (день)
    'bkn_-sn_d': 'wi-day-snow',             // облачно с прояснениями, небольшой снег (день)
    'bkn_sn_d' : 'wi-day-snow',             // переменная облачность, снег (день)
    // ----------------------------------------------------------------------------------------------
    'bkn_+sn_n': 'wi-night-alt-snow',       // облачно, сильный снег (ночь)
    'bkn_-sn_n': 'wi-night-alt-snow',       // облачно с прояснениями, небольшой снег (ночь)
    'bkn_sn_n' : 'wi-night-alt-snow',       // переменная облачность, снег (ночь)
    // ----------------------------------------------------------------------------------------------
    'ovc'      : 'wi-cloudy',               // облачно
    'ovc_+ra'  : 'wi-showers',              // облачно, ливни
    'ovc_-ra'  : 'wi-sleet',                // облачно, временами дождь
    'ovc_ra'   : 'wi-rain',                 // облачно, дождь
    // ----------------------------------------------------------------------------------------------
    'ovc_ra_sn': 'wi-rain-mix',             // облачно, дождь со снегом
    'ovc_ts_ra': 'wi-thunderstorm',         // облачно, дождь, гроза
    // ----------------------------------------------------------------------------------------------
    'ovc_+sn'  : 'wi-snow',                 // облачно, сильный снег
    'ovc_-sn'  : 'wi-snow',                 // облачно, временами снег
    'ovc_sn'   : 'wi-snow',                 // облачно, снег
    // ----------------------------------------------------------------------------------------------
    'skc_d'    : 'wi-day-sunny',            // ясно (день)
    'skc_n'    : 'wi-night-clear',          // ясно (ночь)
    'wnd'      : 'wi-windy'                 // ветренно
}

export const defaultScale = { x: 6, y: 6, l: 1.05, t: .8 }

export function iconScale({ icon })
{
    switch (icon) {
        case/*00*/'bkn_d':     return { ...defaultScale, x: 7,  y: 6, t: 1.05 }
        case/*01*/'bkn_n':     return { ...defaultScale, x: 10, y: 8, t: .9 }

        /* Daytime rain */
        case/*02*/'bkn_+ra_d':
        case/*03*/'bkn_-ra_d':
        case/*04*/'bkn_ra_d':  return { ...defaultScale, x: 5, y: 5, t: 1.05 }

        /* Night rain */
        case/*05*/'bkn_+ra_n':
        case/*06*/'bkn_-ra_n':
        case/*07*/'bkn_ra_n':  return defaultScale

        /* Daytime snow */
        case/*08*/'bkn_+sn_d':
        case/*09*/'bkn_-sn_d':
        case/*10*/'bkn_sn_d':  return { ...defaultScale, x: 5, y: 5, t: 1 }

        /* Night snow */
        case/*11*/'bkn_+sn_n':
        case/*12*/'bkn_-sn_n':
        case/*13*/'bkn_sn_n':  return defaultScale

        /* Cloudy */
        case/*14*/'ovc':       return { ...defaultScale, x: 11, y: 8 }

        /* Cloudy rain */
        case/*15*/'ovc_+ra':
        case/*16*/'ovc_-ra':
        case/*17*/'ovc_ra':

        /* Cloudy mix */
        case/*18*/'ovc_ra_sn':

        /* Cloudy snow */
        case/*19*/'ovc_+sn':
        case/*20*/'ovc_-sn':
        case/*21*/'ovc_sn':

        /* Cloudy thunderstorm rain */
        case/*22*/'ovc_ts_ra': return { ...defaultScale, x: 8,  y: 8, t: 1 }

        /* Clear */
        case/*23*/'skc_d':     return { ...defaultScale, x: 8,  y: 8,  t: 1  }
        case/*24*/'skc_n':     return { ...defaultScale, x: 14, y: 14, l: 1.1, t: .9 }

        /* Windy */
        case/*25*/'wnd':       return { ...defaultScale, x: 20, y: 12, t: .7 }
    }

    return defaultScale
}
