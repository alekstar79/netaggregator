/**
* @see https://gist.github.com/diogocapela/12c6617fc87607d11fd62d2a4f42b02a
* @see https://ru.stackoverflow.com/a/589494/211710
*/

export const timezones = [
    { text: 'UTC+14', value: 14  },
    { text: 'UTC+13', value: 13  },
    { text: 'UTC+12', value: 12  },
    { text: 'UTC+11', value: 11  },
    { text: 'UTC+10', value: 10  },
    { text: 'UTC+9',  value: 9   },
    { text: 'UTC+8',  value: 8   },
    { text: 'UTC+7',  value: 7   },
    { text: 'UTC+6',  value: 6   },
    { text: 'UTC+5',  value: 5   },
    { text: 'UTC+4',  value: 4   },
    { text: 'UTC+3',  value: 3   },
    { text: 'UTC+2',  value: 2   },
    { text: 'UTC+1',  value: 1   },
    { text: 'UTC',    value: 0   },
    { text: 'UTC-1',  value: -1  },
    { text: 'UTC-2',  value: -2  },
    { text: 'UTC-3',  value: -3  },
    { text: 'UTC-4',  value: -4  },
    { text: 'UTC-5',  value: -5  },
    { text: 'UTC-6',  value: -6  },
    { text: 'UTC-7',  value: -7  },
    { text: 'UTC-8',  value: -8  },
    { text: 'UTC-9',  value: -9  },
    { text: 'UTC-10', value: -10 },
]
    .map(tz => ({
        ...tz,
        value: tz.value * 60
    }))
