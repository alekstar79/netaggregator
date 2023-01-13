#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import time
import sys

from daemon import Daemon
from netxcfg import token
from yobit import get_btc

# pidfile = '/var/www/alekstar79/data/www/netaggregator.ru/python/netxbot.pid'
pidfile = '/var/www/expressive.loc/python/netxbot.pid'
endpoint = f'https://api.telegram.org/bot{token}'


def send_message(chat_id, text):
    url = endpoint + '/sendMessage'

    r = requests.get(url, params={
        'chat_id': chat_id,
        'text': text
    })

    return r.json()


def conversation(text):
    answer = 'Я тебя не понимаю'

    try:
        if 'привет' in text:
            answer = 'Привет'
        elif text == '/btc':
            btc = get_btc()['ticker']['last']
            answer = str(btc) + ' usd'
    except KeyError:
        pass

    return answer


def get_updates():
    url = endpoint + '/getUpdates'

    r = requests.get(url)
    return r.json()


class Worker(Daemon):
    last_update_id = 0

    def extract_message(self):
        message = {'chat_id': None, 'text': ''}
        updates = get_updates()

        if updates['ok']:
            try:

                last = updates['result'][-1]
                current_update_id = last['update_id']

                if self.last_update_id != current_update_id:
                    message['chat_id'] = last['message']['chat']['id']
                    message['text'] = last['message']['text']
                    self.last_update_id = current_update_id

            except (IndexError, KeyError):
                pass

        return message

    def run(self):
        while True:
            msg = self.extract_message()

            if msg['chat_id']:
                text = conversation(msg['text'])
                send_message(msg['chat_id'], text)

            time.sleep(3)


if __name__ == '__main__':
    daemon = Worker(pidfile)

    if len(sys.argv) != 2:
        print('usage: %s start|stop|restart' % sys.argv[0])
        sys.exit(2)
    else:
        if 'start' == sys.argv[1]:
            daemon.start()
        elif 'stop' == sys.argv[1]:
            daemon.stop()
        elif 'restart' == sys.argv[1]:
            daemon.restart()
        else:
            print('Unknown command')
            sys.exit(2)

        sys.exit(0)
