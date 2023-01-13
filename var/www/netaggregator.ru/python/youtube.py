#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from pytube import YouTube


# see https://github.com/nficano/pytube
def main():
    YouTube('https://youtu.be/9bZkp7q19f0').streams.first().download()


if __name__ == '__main__':
    main()
