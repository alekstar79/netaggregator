// import connect from 'fastcgi-client'
// import path from 'path'

const transform = new Error('Response transformation failed'),
    connection = new Error('Connection is not established'),
    dirname = path.resolve(),

    DEFAULT = {
        SERVER_SOFTWARE: 'nginx/1.14.0',
        GATEWAY_INTERFACE: 'CGI/1.1',
        SERVER_PROTOCOL: 'HTTP/1.1',
        DOCUMENT_ROOT: dirname + '/static',
        DOCUMENT_URI: '/index.php',
        SCRIPT_NAME: '/index.php',
        CONTENT_LENGTH: '0',
        CONTENT_TYPE: 'application/x-www-form-urlencoded',
        PATH_TRANSLATED: dirname + '/static/index.php',
        SCRIPT_FILENAME: dirname + '/static/index.php',
        FCGI_ROLE: 'RESPONDER',
        PHP_SELF: '/index.php',
        REQUEST_METHOD: 'GET',
        QUERY_STRING: '',
        REQUEST_URI: '',

        HTTP_ACCEPT: 'application/json, text/plain, */*',
        HTTP_ACCEPT_LANGUAGE: 'ru,en-US;q=0.7,en;q=0.3',
        HTTP_ACCEPT_ENCODING: 'gzip, deflate',
        HTTP_CACHE_CONTROL: 'no-cache',
        HTTP_HOST: 'netaggregator.ru',
        HTTP_COOKIE: '',

        REMOTE_ADDR: '127.0.0.1',
        REMOTE_PORT: 3000,
        SERVER_NAME: '127.0.0.1',
        SERVER_ADDR: '127.0.0.1',
        SERVER_PORT: 8080,

        REDIRECT_STATUS: 200
    }

/**
* npm i -S fastcgi-client
* @see https://github.com/LastLeaf/node-fastcgi-client
* @see https://nodejs.org/api/net.html#net_socket_connect
* @see https://habr.com/ru/post/472190
*/
export default (ctx, inject) => {
    ctx.$socket = {
        sockFile: process.env.SOCKET_PATH,
        skipCheckServer: true,
        client: null,

        connect()
        {
            if (this.client) return Promise.resolve(this)

            return new Promise((resolve, reject) => {
                const { sockFile, skipCheckServer } = this,
                    error = reject.bind(null, connection),
                    ready = resolve.bind(null, this)

                this.client = connect({ sockFile, skipCheckServer })

                this.client.on('error', error)
                this.client.on('ready', ready)
            })
        },
        request(options, transformResponse)
        {
            transformResponse || (transformResponse = res => res)

            return new Promise((resolve, reject) => {
                if (!this.client) return reject(connection)

                this.client.request({ ...DEFAULT, ...options }, (error, request) => {
                    if (error) return reject(error)

                    let output = ''
                    let errors = ''

                    request.stdout.on('data', data => { output += data.toString() })
                    request.stderr.on('data', data => { errors += data.toString() })

                    request.stdout.on('end', () => {
                        if (errors) return reject(new Error(errors))

                        const head = output.match(/^[\s\S]*?\r\n\r\n/)[0],
                            parseHead = head.split('\r\n').filter(_ => _),
                            status = { message: '', code: 200 },
                            headers = {}

                        for (const item of parseHead) {
                            const pair = item.split(': ')

                            if (pair.length > 1 && pair[0] && pair[1]) {
                                if (pair[0] in headers) {
                                    headers[pair[0]].push(pair[1])
                                } else {
                                    headers[pair[0]] = [pair[1]]
                                }
                                if (pair[0] === 'Status') {
                                    const match = pair[1].match(/(\d+) (.*)/)

                                    status.code = parseInt(match[1])
                                    status.message = match[2]
                                }
                            }
                        }

                        try {

                            resolve(transformResponse({
                                data: output.slice(head.length),
                                headers,
                                status
                            }))

                        } catch (e) {
                            reject(transform)
                        }
                    })

                    request.stdin.end()
                })
            })
        },
        post(url, data)
        {
        },
        get(url, params)
        {
        }
    }

    inject('socket', ctx.$socket)
}
