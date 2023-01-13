#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# see https://www.youtube.com/watch?v=vrURZbD7zKk&list=PLlWXhlUMyooZx_th2MsNYTeLamdfCMAOm&index=4

import requests
import json

access_token = 'f4ece4c38b68cc9be90f845b003809e032568c10929127d4e9f916c10415870d51ee04bdcbee110c0d75e'
endpoint = 'https://api.vk.com/method'
group_id = 25256330
v = 5.103


def write_json(data, filename='photos.json'):
    with open(filename, 'w') as file:
        json.dump(data, file, indent=4, ensure_ascii=False)


def create_album(title):
    method = '/photos.createAlbum'

    r = requests.get(endpoint + method, params={
        'access_token': access_token,
        'group_id': group_id,
        'title': title,
        'v': v
    }).json()

    write_json(r, 'create_album.json')

    return r


def get_upload_server(album_id):
    method = '/photos.getUploadServer'

    r = requests.get(endpoint + method, params={
        'access_token': access_token,
        'album_id': album_id,
        'group_id': group_id,
        'v': v
    }).json()

    return r['response']


def photos_save(upload):
    method = '/photos.save'

    r = requests.get(endpoint + method, params={
        'access_token': access_token,
        'group_id': upload['gid'],
        'album_id': upload['aid'],
        'server': upload['server'],
        'photos_list': upload['photos_list'],
        'hash': upload['hash'],
        'v': v
    }).json()

    return r


def main():
    # create_album('Fucking Whores')

    server = get_upload_server(album_id=274851196)
    url = server['upload_url']

    file = {'file1': open('upload/cum.jpg', 'rb')}
    upload = requests.post(url, files=file).json()

    photos_save(upload)


if __name__ == '__main__':
    main()
