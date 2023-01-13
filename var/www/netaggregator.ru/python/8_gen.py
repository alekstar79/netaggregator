#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# github https://github.com/bolknote/8ball Evgeny Stepanischev <imbolk@gmail.com>

from itertools import *

R = 150
r = R / 2

phrases = \
    r"""It is certain
It is decidedly so
Without a doubt
Yes — definitely
You may rely on it
As I see it, yes
Most likely
Outlook good
Signs point to yes
Yes
Reply hazy, try again
Ask again later
Better not tell you now
Cannot predict now
Concentrate and ask again
Don’t count on it
My reply is no
My sources say no
Outlook not so good
Very doubtful"""

tags = zip(
    (str(x) + "," + str(y) for x in range(0, R + 1) for y in range(0, R + 1) if
     (x - r) ** 2 + (y - r) ** 2 <= (r + 1) ** 2),
    cycle(phrases.split("\n"))
)

for tag in tags:
    print(r'<div id="?{0}"><a href="#">{1}</a></div>'.format(*tag))
