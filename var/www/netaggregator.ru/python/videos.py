#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# see https://www.youtube.com/watch?v=q3UXjbkX8s8&list=PLlWXhlUMyooZx_th2MsNYTeLamdfCMAOm&index=3

from bs4 import BeautifulSoup
import requests
import json

alekstar_token = 'f4ece4c38b68cc9be90f845b003809e032568c10929127d4e9f916c10415870d51ee04bdcbee110c0d75e'  # alekstar79
artemjev_token = '185b9d120ac8ac8ee2503f73b4edb4e9cd8f2c782badfbb27750e365c59ef629b4fc2a9532783f6bdc2fe'  # artemjevwladimir
endpoint = 'https://api.vk.com/method'
v = 5.103

alekstar_id = 25520481
artemjev_id = 466483621
shornikova_id = 38134266


def write_json(data, filename='videos.json'):
    with open(filename, 'w') as file:
        json.dump(data, file, indent=4, ensure_ascii=False)


def download(url):
    filename = 'saved/videos/' + url.split('/')[-1]
    r = requests.get(url, stream=True)

    with open(filename, 'bw') as file:
        for chunk in r.iter_content(1024000):
            file.write(chunk)


# Now it doesn't work - requires authorization
# Resource link to a BLOB instead of a file
def get_src(url):
    html = requests.get(url).text
    soup = BeautifulSoup(html, 'lxml')

    src = soup.find('div', id='page_wrap').find('div', _class='videoplayer_media')
    print(src)


def fetch_albums():
    method = '/video.getAlbums'

    r = requests.get(endpoint + method, params={
        'access_token': artemjev_token,
        'owner_id': alekstar_id,
        'need_system': 1,
        'v': v
    })

    write_json(r.json(), 'video_albums.json')


def fetch_videos(album_id):
    method = '/video.get'

    r = requests.get(endpoint + method, params={
        'access_token': artemjev_token,
        'owner_id': shornikova_id,
        'album_id': album_id,
        'count': 200,
        'v': v
    })

    write_json(r.json(), f'{album_id}_videos.json')


def main():
    # fetch_videos(-2)

    videos = json.load(open('-2_videos.json'))['response']['items'][-1:]

    for video in videos:
        if 'vk.com' in video['player']:
            get_src(video['player'])


if __name__ == '__main__':
    main()
