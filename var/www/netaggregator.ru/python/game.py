#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# link https://github.com/suguby/python_intensive_2018
# link https://github.com/PythonTurtle/PythonTurtle
# sudo apt install python3-wxgtk4.0 python3-tk

import os
import math
import time
import random
import turtle

BASE_PATH = os.path.dirname(__file__)
BASE_X, BASE_Y = 0, -260
ENEMY_COUNT = 5
BUILDIG_INFOS = {
    'house':      [BASE_X - 500, BASE_Y],
    'kremlin':    [BASE_X - 200, BASE_Y],
    'nuclear':    [BASE_X + 200, BASE_Y],
    'skyscraper': [BASE_X + 400, BASE_Y]
}

window = turtle.Screen()
window.setup(1200, 800)


# helper function
def calc_heading(x1, y1, x2, y2):
    dx = x2 - x1
    dy = y2 - y1

    length = (dx ** 2 + dy ** 2) ** .5
    cos_alpha = dx / length

    alpha = math.acos(cos_alpha)
    alpha = math.degrees(alpha)

    if dy < 0:
        alpha = -alpha

    return alpha


class Missile:

    @property
    def x(self):
        return self.pen.xcor()

    @property
    def y(self):
        return self.pen.ycor()

    def __init__(self, color, x1, y1, x2, y2):
        pen = turtle.Turtle(visible=False)
        pen.color(color)
        pen.speed(0)
        pen.penup()
        pen.setpos(x=x1, y=y1)

        # heading = calc_heading(BASE_X, BASE_Y, x, y)
        heading = pen.towards(x2, y2)

        pen.setheading(heading)
        pen.showturtle()
        pen.pendown()

        self.pen = pen
        self.color = color
        self.state = 'launched'
        self.target = x2, y2
        self.radius = 0

    def step(self):
        if self.state == 'launched':
            self.pen.forward(5)

            if self.pen.distance(x=self.target[0], y=self.target[1]) < 20:
                self.state = 'explode'
                self.pen.shape('circle')

        elif self.state == 'explode':
            self.radius += 1

            if self.radius > 5:
                self.pen.clear()
                self.pen.hideturtle()
                self.state = 'dead'
            else:
                self.pen.shapesize(self.radius)

        elif self.state == 'dead':
            self.pen.hideturtle()
            self.pen.clear()

    def distance(self, x, y):
        return self.pen.distance(x=x, y=y)


class Building:
    INITIAL_HEALTH = 1000

    def __init__(self, x, y, name):
        self.health = self.INITIAL_HEALTH
        self.title_health = None
        self.name = name
        self.x = x
        self.y = y

        pen = turtle.Turtle()
        pen.hideturtle()
        pen.speed(0)
        pen.penup()
        pen.setpos(x=self.x, y=self.y)
        pen.showturtle()

        title = turtle.Turtle(visible=False)
        title.speed(0)
        title.penup()
        title.setpos(x=self.x, y=self.y - 70)
        title.color('purple')

        self.title = title
        self.pen = pen

        self.draw()

    def get_pic_name(self):
        if self.health < self.INITIAL_HEALTH * 0.2:
            return f'{self.name}_3.gif'
        if self.health < self.INITIAL_HEALTH * 0.8:
            return f'{self.name}_2.gif'

        return f'{self.name}_1.gif'

    def draw(self):
        pic_path = os.path.join(BASE_PATH, 'images', self.get_pic_name())

        if self.pen.shape() != pic_path:
            window.register_shape(pic_path)
            self.pen.shape(pic_path)

        if self.health != self.title_health:
            self.title_health = self.health
            self.title.clear()
            self.title.write(str(self.title_health), align='center', font=('Arial', 10, 'bold'))

    def is_alive(self):
        return self.health > 0


class MissileBase(Building):
    INITIAL_HEALTH = 2000

    def get_pic_name(self):
        for missile in our_missiles:
            if missile.distance(self.x, self.y) < 50:
                pic_name = f'{self.name}_opened.gif'
                break
        else:
            pic_name = f'{self.name}.gif'

        return pic_name


def move_missiles(missiles):
    for missile in missiles:
        missile.step()

    dead_missiles = [missile for missile in missiles if missile.state == 'dead']

    for dead in dead_missiles:
        missiles.remove(dead)


def fire_our_missile(x, y):
    info = Missile(color='white', x1=BASE_X, y1=BASE_Y + 20, x2=x, y2=y)
    our_missiles.append(info)


def fire_enemy_missile():
    x = random.randint(-600, 600)
    y = 400

    alive_buildings = [building for building in buildings if building.is_alive()]

    if alive_buildings:
        target = random.choice(alive_buildings)
        info = Missile(color='red', x1=x, y1=y, x2=target.x, y2=target.y)
        enemy_missiles.append(info)


def check_enemy_count():
    if len(enemy_missiles) < ENEMY_COUNT:
        fire_enemy_missile()


def check_interceptions():
    for our_missile in our_missiles:
        if our_missile.state != 'explode':
            continue

        for enemy_missile in enemy_missiles:
            if enemy_missile.distance(our_missile.x, our_missile.y) < our_missile.radius * 10:
                enemy_missile.state = 'dead'


def check_impact():
    for enemy_missile in enemy_missiles:
        if enemy_missile.state != 'explode':
            continue

        for building in buildings:
            if enemy_missile.distance(building.x, building.y) < enemy_missile.radius * 10:
                building.health -= 100

            if building.health < 0:
                building.health = 0


def game_over():
    return base.health <= 0


def draw_buildings():
    for building in buildings:
        building.draw()


base: MissileBase
enemy_missiles: list
our_missiles: list
buildings: list


def game():
    global our_missiles, enemy_missiles, buildings, base

    window.clear()
    window.bgpic('images/background.png')
    window.onclick(fire_our_missile)
    window.tracer(n=2)

    enemy_missiles = []
    our_missiles = []
    buildings = []

    base = MissileBase(x=BASE_X, y=BASE_Y, name='base')
    buildings.append(base)

    for name, position in BUILDIG_INFOS.items():
        b = Building(x=position[0], y=position[1], name=name)
        buildings.append(b)

    # window.mainloop()
    while True:
        window.update()
        if game_over():
            break

        draw_buildings()
        check_enemy_count()
        check_interceptions()
        check_impact()

        move_missiles(missiles=our_missiles)
        move_missiles(missiles=enemy_missiles)
        time.sleep(.01)

    pen = turtle.Turtle(visible=False)
    pen.speed(0)
    pen.penup()
    pen.color('red')
    pen.write('game over', align='center', font=('Arial', 80, 'bold'))


while True:
    game()
    answer = window.textinput(title='Protect The Base', prompt='Want to play again? y/n')
    if answer is None or answer.lower() not in ('д', 'да', 'y', 'yes'):
        break
