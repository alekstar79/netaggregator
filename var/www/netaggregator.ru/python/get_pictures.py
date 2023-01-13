#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import random

from vk_api.exceptions import ApiHttpError, ApiError, VkApiError


def get(id_group, vk):
    try:
        max_num = vk.photos.get(owner_id=id_group, album_id='wall', count=0)['count']
        num = random.randint(1, max_num)

        pictures = vk.photos.get(owner_id=id_group, album_id='wall', count=5, offset=num)['items']

        buf = []
        for element in pictures:
            buf.append('photo' + str(id_group) + '_' + str(element['id']))

        attachment = ','.join(buf)
        print(attachment)

        return attachment

    except (ApiHttpError, ApiError, VkApiError):
        pass
