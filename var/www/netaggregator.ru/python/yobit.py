#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import pickle

# cookie_store = '/var/www/alekstar79/data/www/netaggregator.ru/python/yobit.pickle'
cookie_store = '/var/www/expressive.loc/python/yobit.pickle'

headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:81.0) Gecko/20100101 Firefox/81.0'
}

url = 'https://yobit.net'
api = f'{url}/api/2/btc_usd/ticker'


def save_cookies(cookiejar):
    file = None

    try:

        with open(cookie_store, 'wb') as file:
            pickle.dump(cookiejar, file)
            file.close()
            file = None

    except (FileNotFoundError, PermissionError, IOError):
        pass

    if file:
        file.close()


def load_cookies():
    cookie = None
    file = None

    try:

        with open(cookie_store, 'rb') as file:
            cookie = pickle.load(file)
            file.close()
            file = None

    except (FileNotFoundError, PermissionError, IOError):
        pass

    if file:
        file.close()

    return cookie


def get_btc():
    cookies = load_cookies()

    with requests.Session() as session:
        if not cookies:
            r = session.get(url, headers=headers)
            save_cookies(r.cookies)

        r = session.get(api, headers=headers, cookies=cookies)

        return r.json()
