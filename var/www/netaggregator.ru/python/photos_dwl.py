#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# see https://www.youtube.com/watch?v=86m1DUxlwyA&list=PLlWXhlUMyooZx_th2MsNYTeLamdfCMAOm&index=2

import requests
import json

access_token = 'f4ece4c38b68cc9be90f845b003809e032568c10929127d4e9f916c10415870d51ee04bdcbee110c0d75e'
endpoint = 'https://api.vk.com/method'
user_id = 25520481
v = 5.103


def write_json(data, filename='photos.json'):
    with open(filename, 'w') as file:
        json.dump(data, file, indent=4, ensure_ascii=False)


def download(url):
    filename = 'saved/photos/' + url.split('/')[-1]
    r = requests.get(url, stream=True)

    with open(filename, 'wb') as file:
        for chunk in r.iter_content(4096):
            file.write(chunk)


def fetch_albums():
    method = '/photos.getAlbums'

    r = requests.get(endpoint + method, params={
        'access_token': access_token,
        'owner_id': user_id,
        'need_system': 1,
        'v': v
    })

    write_json(r.json(), 'photo_albums.json')


def fetch_photos(album_id):
    method = '/photos.get'

    r = requests.get(endpoint + method, params={
        'access_token': access_token,
        'owner_id': user_id,
        'album_id': album_id,
        'photo_sizes': 1,
        'count': 1000,
        'v': v
    })

    write_json(r.json(), f'{album_id}_photos.json')


def get_largest(size):
    return size['width']


def main():
    # fetch_photos('saved')

    photos = json.load(open('saved_photos.json'))['response']['items']

    for photo in photos:
        sizes = photo['sizes']
        max_size_url = max(sizes, key=get_largest)['url']
        download(max_size_url)


if __name__ == '__main__':
    main()
