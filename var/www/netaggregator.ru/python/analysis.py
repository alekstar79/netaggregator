#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from datetime import datetime
from time import sleep

import requests
import json
import csv

access_token = 'f4ece4c38b68cc9be90f845b003809e032568c10929127d4e9f916c10415870d51ee04bdcbee110c0d75e'
endpoint = 'https://api.vk.com/method'
v = 5.103

group_id = '-30666517'
method = '/wall.get'


def to_json(post_dict):
    try:
        data = json.load(open('posts_data.json'))
    except (IOError, json.JSONDecodeError):
        data = []

    data.append(post_dict)

    with open('posts_data.json', 'w') as file:
        json.dump(data, file, indent=4, ensure_ascii=False)


def write_csv(data):
    with open('posts_data.csv', 'a') as file:
        writer = csv.writer(file)

        writer.writerow({data['likes'], data['reposts'], data['text']})


def get_data(post):
    try:
        post_id = post['id']
    except KeyError:
        post_id = 0
    try:
        likes = post['likes']['count']
    except KeyError:
        likes = 0
    try:
        reposts = post['reposts']['count']
    except KeyError:
        reposts = 0
    try:
        text = post['text']
    except KeyError:
        text = ''

    data = {
        'id': post_id,
        'likes': likes,
        'reposts': reposts,
        'text': text
    }

    return data


def main():
    start = datetime.now()

    # year_earlier = 1567862882
    month_earlier = 1596720482

    all_posts = []
    offset = 0

    while True:
        sleep(1)

        r = requests.get(endpoint + method, params={
            'artemjev_token': access_token,
            'owner_id': group_id,
            'offset': offset,
            'count': 100,
            'v': v
        })

        posts = r.json()['response']['items']

        all_posts.extend(posts)

        oldest_post_date = posts[-1]['date']

        offset += 100
        print(offset)

        if oldest_post_date < month_earlier:
            break

    for post in all_posts:
        post_data = get_data(post)
        to_json(post_data)

    end = datetime.now()
    total = end - start

    print(len(all_posts))
    print(str(total))


if __name__ == '__main__':
    main()
