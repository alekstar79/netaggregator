#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from datetime import datetime

from vk_api.exceptions import AuthError, ApiHttpError, ApiError, VkApiError
from vk_api.keyboard import VkKeyboard, VkKeyboardColor
from vk_api.longpoll import VkLongPoll, VkEventType
from vk_api.utils import get_random_id

import vk_api
import get_pictures

login, password = 'alekstar79@yandex.ru', 'iPhone16s64gb'
vk_session = vk_api.VkApi(login, password, app_id=2685278)

try:
    vk_session.auth(token_only=True)
except AuthError as auth_error:
    print(auth_error)
    exit(2)

session_api = vk_session.get_api()
longpoll = VkLongPoll(vk_session)


# This is a chat bot feature
def create_keyboard(message):
    vk_keyboard = VkKeyboard(one_time=False)

    if message == 'тест':
        vk_keyboard.add_button('Белая кнопка', color=VkKeyboardColor.DEFAULT)
        vk_keyboard.add_button('Зелёная кнопка', color=VkKeyboardColor.POSITIVE)

        vk_keyboard.add_line()
        vk_keyboard.add_button('Красная кнопка', color=VkKeyboardColor.NEGATIVE)

        vk_keyboard.add_line()
        vk_keyboard.add_button('Синяя кнопка', color=VkKeyboardColor.PRIMARY)
        vk_keyboard.add_button('Привет', color=VkKeyboardColor.PRIMARY)

    elif message == 'привет':
        vk_keyboard.add_button('Тест', color=VkKeyboardColor.POSITIVE)

    elif message == 'котики':
        vk_keyboard.add_button('Котики!', color=VkKeyboardColor.POSITIVE)

    elif message == 'закрыть':
        return vk_keyboard.get_empty_keyboard()

    vk_keyboard = vk_keyboard.get_keyboard()

    return vk_keyboard


def send_message(vk, id_type, owner_id, message=None, attachment=None, keyboard=None):
    random_id = get_random_id()

    try:
        vk.method('messages.send',
                  {id_type: owner_id, 'message': message, 'random_id': random_id,
                   'attachment': attachment, 'keyboard': keyboard})
    except (ApiHttpError, ApiError, VkApiError) as send_msg_error:
        print(send_msg_error)


for event in longpoll.listen():
    if event.type == VkEventType.MESSAGE_NEW:
        print('Сообщение пришло в: ' + datetime.strftime(datetime.now(), "%H:%M:%S"))
        print('Текст сообщения: ' + event.text)
        print(event.user_id)

        response = event.text.lower()

        # keyboard = create_keyboard(response)

        if event.from_user and not event.from_me:
            if response == 'котики':
                attachment = get_pictures.get(-130670107, session_api)
                send_message(vk_session, 'user_id', event.user_id, message='Держи котиков!', attachment=attachment)

            elif response == 'привет':
                send_message(vk_session, 'user_id', event.user_id, message='Нажми на кнопку, чтобы получить список команд')

            elif response == 'тест':
                send_message(vk_session, 'user_id', event.user_id, message='Тестовые команды')

            elif response == 'команды':
                send_message(vk_session, 'user_id', event.user_id, message='Список команд бота: \n\n 1)Команда1\n 2)Команда2')

            elif response == 'закрыть':
                send_message(vk_session, 'user_id', event.user_id, message='Закрыть')

        elif event.from_chat:
            if response == 'котики':
                attachment = get_pictures.get(-130670107, session_api)
                send_message(vk_session, 'chat_id', event.chat_id, message='Держите котиков!')

        print('-' * 30)
