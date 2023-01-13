#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pickle


def create_dump(data):
    with open('dump.pickle', 'wb') as f:
        pickle.dump(data, f)


def read_dump():
    data = None

    try:
        with open('dump.pickle', 'rb') as f:
            data = pickle.load(f)
    except FileNotFoundError:
        pass

    return data


def main():
    # create_dump({ 'test': 'dump-py', 'v': 1.1 })
    dump = read_dump()
    print(dump)


if __name__ == '__main__':
    main()
