#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import time
import sys

from daemon import Daemon

# pidfile = '/var/www/alekstar79/data/www/netaggregator.ru/python/daemon.pid'
pidfile = '/var/www/expressive.loc/python/daemon.pid'


# noinspection PyMethodMayBeStatic
class Worker(Daemon):
    def run(self):
        while True:
            # Your code here
            time.sleep(1)


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
