#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import vk_api

# see https://github.com/python273/vk_api/tree/master/examples


def main():
    """ Получение последнего сообщения со стены """

    login, password = 'alekstar79@yandex.ru', 'iPhone16s64gb'
    vk_session = vk_api.VkApi(login, password)

    try:
        vk_session.auth(token_only=True)
    except vk_api.AuthError as error_msg:
        print(error_msg)
        return

    vk = vk_session.get_api()

    """ VkApi.method позволяет выполнять запросы к API. В этом примере
        используется метод wall.get (https://vk.com/dev/wall.get) с параметром
        count = 1, т.е. мы получаем один последний пост со стены текущего
        пользователя.
    """
    response = vk.wall.get(count=1)

    if response['items']:
        print(response['items'][0])


if __name__ == '__main__':
    main()
