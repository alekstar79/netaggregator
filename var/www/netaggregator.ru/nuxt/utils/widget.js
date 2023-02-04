import { ratio, akeys, skeys, pkeys, names, other, tkeys, avoid, dirty } from '~/assets/data/widget'
import { rndstring } from './common/symbols.mjs'
import { rtrim } from './common/is-string.mjs'
import { sha256 } from 'hash.js'

import vk from '@vkontakte/vk-bridge'

export const strrepeat = c => '    '.repeat(c)

let widgetPreview = 'VKWebAppShowCommunityWidgetPreviewBox',
  API = 'VKWebAppCallAPIMethod',

  $1 = strrepeat(1),
  $2 = strrepeat(2),

  values,
  vars,
  api

const _sorted = set => Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b))
const _assign = v => values = v

const RS = (entity, method, query, name = null, declare = 'var ') => name || declare
  ? `${declare}${name || entity} = API.${entity}.${method}(${query});`
  : `API.${entity}.${method}(${query});`

const groupsIsMember = v => RS('groups', 'isMember', '{ group_id: gid, user_id: uid }', v, '')
const userGet = f => RS('users', 'get', f.length ? `{ fields: '${f.join(',')}' }` : '{}')
const unixtime = v => RS('utils', 'getServerTime', '{ user_id: Args.uid }', v)

const condition = (cond, perform, indent = '') => {
  let code = ''

  code += `${indent}if (${cond}) {\n`
  code += `${indent}${perform}\n`
  code += `${indent}}`

  return code
}

const apiVAR = v => {
  if (v in names) {
    v = v.replace(/^(first|last)(name)$/, '$1_$2')
  }

  return `users[0].${v}`
}

const getVAR = (variable, api) => {
  let value = 'null'

  if (variable in pkeys) {
    value = `Args.${variable}`
  }
  if (!api && variable in values) {
    value = values[variable]
  }
  if (api && variable in akeys) {
    value = apiVAR(variable)
  }

  return `${variable} = ${value};`
}

const varDeclare = (vars, n, def = 'var ') => vars.reduce((c, v) => {
  c += n + def + getVAR(v, false); n = '\n'
  return c
}, '')

const mapAssign = map => Object.keys(map).reduce((c, v) => {
  return `${c}${$1}${v} = ${map[v]};\n`
}, '')

const apiIF = vars => {
  if (!vars.length) return ''

  vars = vars.filter(k => k in akeys).map(v => getVAR(v, true)).join(`\n${$1}`)
  return condition('users.length', $1 + vars)
}

const member = (gid, variable, value, nl = true) => {
  let n = nl ? '\n\n' : '', code = ''

  code += `gids = [${gid.join(',')}];\n`
  code += `while (${variable} == ${value} && (gid = gids.pop())) {\n`
  code += `${$1}${groupsIsMember(variable)}\n`
  code += `}${n}`

  return code
}

const isMember = (gid, not) => {
  let code = member(gid, 'member', 0, !not)

  code += !not ? condition('member == 0', `${$1}return {};`) : ''

  return code
}

const notMember = (gid, mem) => {
  let cond = mem ? 'member == 0 || notmember == 1' : 'notmember == 1',
    code = member(gid, 'notmember', 1)

  code += condition(cond, `${$1}return {};`)

  return code
}

const include = (array, value, variable = '') => {
  let assign = !!variable, code = ''

  array = `[${array.join(',')}]`
  !assign && (variable = array)

  code += assign ? `${variable} = ${array};\n` : ''
  code += condition(
    `!!${value} && ${variable}.indexOf(${value}) == -1`,
    `${$1}return {};`
  )

  return code
}

const split = (value, perform) => {
  let code = `${value} = ${value}.split(', ');\n`

  code += condition(`${value}.length`, perform)

  return code
}

const intersect = (arr1, arr2, variable = 'test') => {
  arr2 = arr2.map(s => `'${s}'`).join(',')

  let code = `${$1}var ${variable} = false;\n\n`

  code += `${$1}set = [${arr2}];\n`
  code += `${$1}while (!${variable} && ${arr1}.length) {\n`
  code += `${$2}${variable} = set.indexOf(${arr1}.pop()) != -1;\n`
  code += `${$1}}\n\n`

  code += condition(`!${variable}`, `${$1}return {};`, $1)

  return code
}

const rangeCondition = range => {
  let cond = [], code = ''

  if (range.from) {
    cond.push(`age < ${range.from}`)
  }
  if (range.to) {
    cond.push(`age > ${range.to}`)
  }
  if (cond.length) {
    code = `${cond.join(' || ')}`
  }
  if (cond.length > 1) {
    code = `(${code})`
  }

  return code
}

const monthDays = (indent = '') => {
  let code = `${indent}c = [31, fb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n`

  code += `${indent}md = 0;\n`
  code += `${indent}while (i >= 0) {\n`
  code += `${indent}${$1}md = md + c[i];\n`
  code += `${indent}${$1}i = i - 1;\n`
  code += `${indent}}\n`

  return code
}

const leap = (y, variable, indent = '') => {
  let af = rndstring(5, 'lower'),
    at = rndstring(5, 'lower'),
    ft = rndstring(5, 'lower'),
    code = ''

  code += `${indent}${$1}${af} = 1,\n`
  code += `${indent}${$1}${at} = 1,\n`
  code += `${indent}${$1}${ft} = 1;\n\n`

  code += `${indent}${af} = parseInt(('' + (${y} /   4)).split('.')[1]);\n`
  code += `${indent}${at} = parseInt(('' + (${y} / 100)).split('.')[1]);\n`
  code += `${indent}${ft} = parseInt(('' + (${y} / 400)).split('.')[1]);\n`
  code += '\n'

  code += `${indent}if (${af} == 0 && ${at} != 0 || ${ft} == 0) {\n`
  code += `${indent}${$1}${variable} = true;\n`
  code += `${indent}}\n`

  return code
}

const age = (bdate, u = 'utm', indent = '') => {
  let date = "bdate.split('.')", code = ''

  if (bdate) {
    date = 'bdate'
  }

  code += `${indent}var d = ${date},\n`
  code += `${indent}${$1}time = 0;\n\n`
  code += `${indent}if (!!d[2]) {\n`
  code += `${indent}${$1}var leapage = false,\n`
  code += `${indent}${$2}da = parseInt(d[1]),\n`
  code += `${indent}${$2}dd = parseInt(d[2]),\n`
  code += `${indent}${$2}fb = 28,\n`
  code += `${indent}${$2}md = 0,\n`
  code += `${indent}${$2}i = -1,\n`
  code += `${indent}${$2}c = [],\n\n`

  code += leap('dd', 'leapage', indent + $1)

  code += `${indent}${$1}if (!!leapage) {\n`
  code += `${indent}${$2}fb = 29;\n`
  code += `${indent}${$1}}\n`
  code += `${indent}${$1}if (da >= 2) {\n`
  code += `${indent}${$2}i = da - 2;\n`
  code += `${indent}${$1}}\n\n`

  code += monthDays(indent + $1)
  code += '\n'

  code += `${indent}${$1}time = (dd - 1970) * 31556926 + md * 86400 + (d[0] - 1) * 86400;\n`
  code += `${indent}${$1}age = parseInt(${u} / 31556926 - time / 31556926);\n`
  code += `${indent}}`

  return code
}

const now = (u = 'utm', indent = '') => {
  let code = `${indent}var g = parseInt(${u} / 31556926),\n`,
    offset = indent ? '' : $1

  code += `${indent}${$1}Y = 1970 + g,\n`
  code += `${indent}${$1}M = 0,\n`
  code += `${indent}${$1}D = 0,\n\n`

  code += `${indent}${$1}leapnow = false,\n`
  code += `${indent}${$1}ms = 2505600,\n`
  code += `${indent}${$1}md = 0,\n`
  code += `${indent}${$1}m = 0,\n\n`

  code += `${indent}${$1}fb = 28,\n`
  code += `${indent}${$1}i = -1,\n`
  code += `${indent}${$1}c = [],\n\n`

  code += leap('Y', 'leapnow', indent)

  code += `${indent}if (!!leapnow) {\n`
  code += `${indent}${$1}fb = 29;\n`
  code += `${indent}}\n\n`

  code += `${indent}m = (${u} - g * 31556926) / ms;\n`
  code += `${indent}M = parseInt(m);\n`
  code += `${indent}if (M >= 1) {\n`
  code += `${indent}${$1}i = M - 1;\n`
  code += `${indent}}\n\n`

  code += monthDays(indent)
  code += '\n'

  code += `${indent}D = parseInt((${u} - g * 31556926 - md * 86400) / 86400);\n\n`

  code += condition('M < m',  `${indent}${offset}M = M + 1;`,   indent) + '\n'
  code += condition('M < 10', `${indent}${offset}M = '0' + M;`, indent) + '\n'
  code += condition('D < 10', `${indent}${offset}D = '0' + D;`, indent) + '\n'
  code += `\n${indent}now = D + '.' + M + '.' + Y;`

  return code
}

const ageRange = (range, u = 'utm') => {
  let code = condition('!!bdate', age(false, u, $1)),
    cond = rangeCondition(range)

  code += '\n\n'
  code += `if (!!age && ${cond}) {\n`
  code += `${$1}return {};\n`
  code += '}'

  return code
}

const birthDaysLeft = (date, u = 'utm') => {
  let code = now(u, $1)

  code += '\n\n'
  code += `${$1}bdate = bdate.split('.');\n`
  code += `${$1}var bm = parseInt(bdate[1]),\n`
  code += `${$2}bd = parseInt(bdate[0]);\n\n`

  code += `${$1}if (bm != M || bd - D < 0 || bd - D > ${date - 1}) {\n`
  code += `${$2}return {};\n`
  code += `${$1}}`

  return condition('!!bdate', code)
}

const dateWork = (range, date) => {
  let cond = rangeCondition(range),
    code = ''

  code += now('utm', $1) + '\n\n'
  code += age(false, 'utm', $1)

  code += '\n\n'
  code += `${$1}var bm = parseInt(d[1]),\n`
  code += `${$2}bd = parseInt(d[0]);\n\n`

  code += `${$1}if (!!age && ${cond}) {\n`
  code += `${$2}return {};\n`
  code += `${$1}}\n`

  code += `${$1}if (bm != M || bd - D < 0 || bd - D > ${date - 1}) {\n`
  code += `${$2}return {};\n`
  code += `${$1}}`

  return condition('!!bdate', code)
}

const collect = data => {
  data.forEach(k => {
    if (k in dirty) {
      vars.add(k)
    }
    if (k in ratio) {
      k = ratio[k]
    }
    if (k in avoid) {
      return
    }
    if (k in { ...other, users: 1 }) {
      if (k in other) {
        vars.add('gids')
        vars.add('gid')
        vars.add(k)
      }

      vars.add('uid')
      return
    }
    if (k in names) {
      vars.add(k)
      return
    }
    if (k in akeys) {
      api.add(k)
      return
    }

    vars.add(k)
  })

  return {
    vars: _sorted(vars),
    api: _sorted(api)
  }
}

const extendReadConditions = (readers, keys) => {
  let checks = [], extend = { api: '', if: '' }

  vars = new Set()
  api = new Set()

  if (keys.some(k => k in tkeys)) {
    extend.api = unixtime('utm')
    vars.add('now')
  }
  if ('sex' in readers) {
    const v = readers.sex.current,
      $1 = strrepeat(1)

    checks.push(condition(`!!sex && sex != ${v}`, `${$1}return {};`))
  }
  if ('age' in readers && 'bdate' in readers) {
    checks.push(dateWork(readers.age.current, readers.bdate.current))

  } else if ('age' in readers) {
    checks.push(ageRange(readers.age.current))

  } else if ('bdate' in readers) {
    checks.push(birthDaysLeft(readers.bdate.current))
  }
  if ('relation' in readers) {
    checks.push(include(readers.relation, 'relation', 'set'))
  }
  if ('cities' in readers) {
    checks.push(include(readers.cities.map(c => typeof c === 'object' ? c.id : c), 'city.id', 'set'))
  }
  if ('platform' in readers) {
    checks.push(include(
      readers.platform.map(p => `'${p}'`),
      'platform',
      'set'
    ))
  }
  if ('member' in readers) {
    checks.push(isMember(readers.member, 'notmember' in readers))
  }
  if ('notmember' in readers) {
    checks.push(notMember(readers.notmember, 'member' in readers))
  }
  if ('interests' in readers) {
    checks.push(split(
      'interests',
      intersect('interests', readers.interests)
    ))
  }
  if ('firstnames' in readers) {
    checks.push(include(
      readers.firstnames.map(p => `'${p}'`),
      'firstname',
      'set'
    ))
  }
  if ('lastnames' in readers) {
    checks.push(include(
      readers.lastnames.map(p => `'${p}'`),
      'lastname',
      'set'
    ))
  }
  if ('users' in readers) {
    checks.push(include(readers.users, 'uid', 'set'))
  }
  if (checks.length) {
    extend.if += checks.join('\n\n')

    if (keys.some(k => k in skeys)) {
      vars.add('set')
    }
  }

  return extend
}

export function predefine(variables, alter, map, values, readers)
{
  const keys = Object.keys(readers)

  variables = Array.from(variables)
  variables = variables
    .filter(v => !/^alter\.\w+/g.test(v))
    .concat(keys)

  alter = Array.from(alter)
  _assign(values)

  let ext = extendReadConditions(readers, keys),
    { api, vars } = collect(variables),

    isAgeVars = vars.includes('age'),
    isNowVars = vars.includes('now'),
    isDateKeys = keys.includes('bdate'),
    isAgeKeys = keys.includes('age'),

    n = keys.length ? '\n\n' : '',

    name = false,
    cond = false,
    code = '',
    lang,
    sex

  if (!api.length && !vars.length) {
    return code
  }
  if ((isAgeVars || isNowVars) && !(isDateKeys || isAgeKeys)) {
    ext.api += unixtime('utm')
  }
  if (isAgeVars && !isAgeKeys) {
    ext.if += (ext.if ? '\n\n' : '') + age(readers.bdate)
  }
  if (isNowVars && !isDateKeys) {
    ext.if += (ext.if ? '\n\n' : '') + now()
  }

  name = vars.some(v => ({ firstname: 1, lastname: 1 }[v]))
  cond = api.length || name

  ext.api && (code += ext.api)
  n = code ? '\n' : ''

  code += cond ? n + userGet(api) : ''
  n = code ? '\n' : ''

  vars = _sorted(new Set(api.concat(vars)))

  code += varDeclare(vars, n)
  code += cond ? '\n\n' + apiIF(vars) : ''
  code += ext.if ? '\n\n' + ext.if : ''

  if (alter.length) {
    code += varDeclare(alter, code ? '\n\n' : '', '')
  }
  if ((sex = mapAssign(map.sex))) {
    code += '\n\n' + condition('sex != 2', rtrim(sex))
  }
  if ((lang = mapAssign(map.lang))) {
    code += '\n\n' + condition('lang != 0', rtrim(lang))
  }

  return code
}

export const send = (method, params) => vk.send(API, { method, params })
export const hash = string => sha256().update(string).digest()

export const update = params => send('appWidgets.update', params)
export const preview = params => vk.send(widgetPreview, params)

export const error = (content = 'Ошибка', raw = false) => ({ content, color: 'error', raw })
export const success = (content, raw = false) => ({ content, color: 'success', raw })
export const checkingUpdates = ($1, $2) => $2 ? hash($1) === hash($2) : true

export const clone = v => { try {
  return JSON.parse(JSON.stringify(v))

} catch (e) {
} }

export function extendComputed(entity)
{
  function get()
  {
    switch (this.human) {
      case 'female':
        return this.alter.female[entity]

      case 'lang':
        return this.alter.lang[entity]
    }

    return this.widget[entity]
  }

  function set(value)
  {
    let alter = null

    switch (this.human) {
      case 'female': alter = 'female'; break
      case 'lang': alter = 'lang'; break
    }

    this.$store.commit('widget/setWidget', {
      entity,
      value,
      alter
    })
  }

  return { value: { get, set } }
}
