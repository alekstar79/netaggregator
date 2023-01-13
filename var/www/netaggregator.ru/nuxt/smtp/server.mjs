// import { simpleParser } from 'mailparser'
import { SMTPServer } from 'smtp-server'

/**
* @see https://github.com/nodemailer/smtp-server/blob/master/examples/server.js
*/
const server = new SMTPServer({
  secure: false,
  logger: true,

  banner: 'SMTP Server',

  disableReverseLookup: true,

  // disable STARTTLS to allow authentication in clear text mode
  // disabledCommands: ['AUTH', 'STARTTLS'],

  // By default only PLAIN and LOGIN are enabled
  // authMethods: ['PLAIN', 'LOGIN', 'CRAM-MD5'],

  // Accept messages up to 10 MB
  size: 10 * 1024 * 1024,

  // allow overriding connection properties. Only makes sense behind proxy
  useXClient: true,

  // use logging of proxied client data. Only makes sense behind proxy
  useXForward: true,

  hidePIPELINING: true,
  hideSTARTTLS: true,
  hide8BITMIME: true,
  hideSMTPUTF8: true,

  // Setup authentication
  onAuth(auth, session, callback) {
    let username = 'support@netaggregator.ru'
    let password = 'support@netaggregator.ru'

    if (
      auth.username === username &&
      (auth.method === 'CRAM-MD5'
        ? auth.validatePassword(password) // if cram-md5, validate challenge response
        : auth.password === password)     // for other methods match plaintext passwords
    ) {
      return callback(null, {
        user: 'support@netaggregator.ru'
      })
    }

    return callback(new Error('Authentication failed'))
  },

  // Validate MAIL FROM envelope address. If this method is not set, all addresses are allowed
  /* onMailFrom(address, session, callback) {
    if (/^deny/i.test(address.address)) {
      return callback(new Error('Not accepted'))
    }

    callback()
  }, */

  // Validate RCPT TO envelope address. If this method is not set, all addresses are allowed
  /* onRcptTo(address, session, callback) {
    let err

    if (/^deny/i.test(address.address)) {
      return callback(new Error('Not accepted'))
    }

    // Example: reject messages larger than 100 bytes to an over-quota user
    if (address.address.toLowerCase() === 'almost-full@example.com' && Number(session.envelope.mailFrom.args.SIZE) > 100) {
      err = new Error('Insufficient channel storage: ' + address.address)
      err.responseCode = 452
      return callback(err)
    }

    callback()
  }, */

  // Handle message stream
  onData(stream, session, callback) {
    /* simpleParser(stream, {}, (err, parsed) => {
      if (err) console.log('Error:' , err)

      console.log(parsed)
      stream.on('end', callback)
    }) */

    stream.pipe(process.stdout)
    stream.on('end', () => {
      let err;

      if (stream.sizeExceeded) {
        err = new Error('Error: message exceeds fixed maximum message size 10 MB')
        err.responseCode = 552
        return callback(err)
      }

      callback(null, 'Message queued')
    })
  }
})

server.on('error', err => {
  console.log({ err });
})

server.listen(25)
