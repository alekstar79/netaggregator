import { createTransport } from 'nodemailer'

async function send({ subject, html, done, reject })
{
  const transport = createTransport({
    name: 'netaggregator.ru',
    port: 25,
    secure: false,
    connectionTimeout: 5000,
    auth: {
      user: 'support@netaggregator.ru',
      pass: 'support@netaggregator.ru'
    },
    tls: {
      rejectUnauthorized: false,
    }
  });

  transport.sendMail({
    from: 'support@netaggregator.ru',
    to: 'alekstar79@yandex.ru',
    subject,
    html,
  })
    .then(done)
    .catch(reject)
}

;(async () => {
  await send({
    subject: 'Тестовое письмо',
    html: `<h2>Здравствуйте, Наталья Вячеславовна</h2><p>Вы были зарегистрированы на платформе «Открытая школа».<p><p>Ваш логин: kudimovanv@gmail.com<br>Ваш пароль: cpBXT8r<p><p>Для авторизации на портале «Открытая школа» перейдите по этой одноразовой <a href="https://login.2035school.ru/authorization/nowuanflywj8b7p_iockfblbu">ссылке</a></p><p>Далее, вы можете:</p><p>В форме входа выбирать закладку "Без пароля", вводить свой почтовый адрес и получать на него такие же письма с одноразовыми ссылками на вход.<br>Или в форме входа выбирать закладку "С паролем", вводить свой почтовый адрес и пароль, полученный в этом письме. Пароль можно изменить в личном кабинете.</p><p>Если вы забудете пароль, на форме входа воспользуйтесь закладкой "Без пароля", введите свой почтовый адрес, в личном кабинете поменяйте пароль.</p><p>С подробной инструкцией по работе с платформой Вы можете ознакомиться по <a href="https://drive.google.com/file/d/1rkcDUSI37X4RybqZj0Yxxm0cLXuNLoyI/view">ссылке</a></p><p>Вы можете увидеть список <a href="http://2035school.ru/journal">учеников</a>, выдать им <a href="http://2035school.ru/tasks">задания</a> и просмотреть <a href="http://2035school.ru/lessons">уроки</a>, которые есть на портале.
    </p><p>Также приглашаем Вас принять участие в предстоящих вебинарах, посвященным развитию ИКТ компетенций педагогов. Записаться на вебинар можно по <a href="https://2035school.ru/edu/programs/webinars">ссылке</a>. Участие в вебинарах бесплатное.
    </p><p>С уважением,<br/>коллектив Открытой школы<br><a href="http://2035school.ru/">2035school.ru</a></p>`,
    done: (...args) => {
      console.log('done', ...args)
    },
    reject: (...args) => {
      console.log('reject', ...args)
    }
  })
})()
