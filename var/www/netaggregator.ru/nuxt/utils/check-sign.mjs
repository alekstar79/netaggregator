// noinspection JSIncompatibleTypesComparison

const EMPTY = '', AMP = '&'

/**
 * @see https://gist.github.com/eolme/88a8f5b15b1f355f58f037dc774103d3
 * @param {String} authorization
 * @param {String} secret
 * @return {Boolean}
 * @notes Я передаю параметры запуска в запросе к бэку в заголовке Authorization,
 *        в виде VK <base64_params>. Так удобнее и использует спеки HTTP
 */
export const validation = (authorization, secret) => {
  const decodedParams = Buffer.from(authorization.slice(3), 'base64').toString('utf8')

  let match = null, sign = EMPTY, param = EMPTY, params = EMPTY
  while ((match = /([\w-]+)=([^&]*)/g.exec(decodedParams)) !== null) {
    param = match[1]

    if (param === 'sign') {
      sign = match[2]
      continue
    }

    if (param.startsWith('vk_')) {
      params += match[0]
      params += AMP
    }
  }

  const hmac = crypto.createHmac('sha256', secret)

  hmac.update(params.slice(0, -1))

  const digest = hmac.digest('base64url')

  return digest === sign
}
