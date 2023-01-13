#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# @see https://habr.com/ru/post/491276

import json
import pickle
import re
import requests

with open('cookies_vk_auth.pickle', 'rb') as f:
    cookies_final = pickle.load(f)

session = requests.Session()
peer_id = int(input('User ID: '))

response = session.get('https://vk.com/dev/messages.getHistoryAttachments', cookies=cookies_final)
hash_data = re.findall('data-hash="(S*)"', response.text)[0]

session = requests.Session()
response = session.post('https://vk.com/dev',
                        data='act=a_run_method&al=1&hash={hash_data}&method=messages.getHistoryAttachments&param_count=20&param_max_forwards_level=45&param_media_type=photo&param_peer_id={peer_id}&param_photo_sizes=0&param_preserve_order=0&param_v=5.103',
                        cookies=cookies_final)

count = 20

for i in range(200):
    response_json = json.loads(json.loads(response.text[4:])['payload'][1][0])['response']['items']

    for photo in response_json:
        ph = photo['attachment']['photo']['sizes'][-1]['url']
        r = session.get(ph, timeout=10)

        if r.status_code == 200:
            with open('./' + str(ph.split('https://habr.com/')[-1]), 'wb') as f:
                f.write(r.content)

    m_id = photo['message_id']
    response = session.post('https://vk.com/dev',
                            data='act=a_run_method&al=1&hash={hash_data}&method=messages.getHistoryAttachments&param_count=20&param_start_from={m_id}&param_max_forwards_level=45&param_media_type=photo&param_peer_id={peer_id}&param_photo_sizes=0&param_preserve_order=0&param_v=5.103',
                            cookies=cookies_final)
