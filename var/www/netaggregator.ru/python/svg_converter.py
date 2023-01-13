#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# see https://www.linux.org.ru/forum/development/15350723

import argparse
import fnmatch
import sys

from pathlib import Path
from string import Template

import svgutils


def scale(src, width=None, height=None, dst=None):
    dst = dst or src

    origin = svgutils.transform.fromfile(src)
    width = width or origin.width
    height = height or origin.height

    origin_width, origin_height = 0, 0
    move_x, move_y = 0, 0
    scale_factor = 1

    try:
        origin_width = float(str(origin.width).rstrip('px'))
        if width > origin_width:
            # move_x = (width / 2) - (origin_width / 2)
            pass
    except (ValueError, TypeError):
        pass

    try:
        origin_height = float(str(origin.height).rstrip('px'))
        if height > origin_height:
            # move_y = (height / 2) - (origin_height / 2)
            pass
    except (ValueError, TypeError):
        pass

    try:
        if height > origin_height or width > origin_width:
            scale_factor = height / origin_height
    except (ValueError, TypeError):
        pass

    print(f"Converting {src} to {dst}: width: {origin_width} -> {width}, "
          f"height: {origin_height} -> {height}, move: {move_x}, {move_y}, "
          f"scale: {scale_factor}")

    svg = svgutils.compose.SVG(src)
    # fig = svgutils.compose.Figure(width, height, svg).move(move_x, move_y)
    fig = svgutils.compose.Figure(width, height, svg).scale(scale_factor)
    fig.save(dst)


def main(argv=None):
    if argv is None:
        argv = sys.argv

    parser = argparse.ArgumentParser(description='Resize SVG.')
    parser.add_argument('files', metavar="FILE", nargs='+',
                        help='files to scale')
    parser.add_argument('--width', default=None, type=float,
                        help='destination width of SVG')
    parser.add_argument('--height', default=None, type=float,
                        help='destination height of SVG')
    parser.add_argument('--pattern', default="*",
                        help='pattern for files to scale')
    parser.add_argument('--template', default=None,
                        help='output filename template')

    args = parser.parse_args(argv[1:])

    for src in args.files:
        src = Path(src)
        if not src.is_file():
            continue

        if not fnmatch.fnmatch(src.name, args.pattern):
            continue

        if not args.template:
            dst = src
        else:
            template = Template(args.template)
            dst = Path(template.safe_substitute(
                full_name=str(src),
                drive=src.drive,
                root=src.root,
                anchor=src.anchor,
                parent=src.parent,
                name=src.name,
                suffix=src.suffix,
                stem=src.stem,
                as_posix=src.as_posix(),
                as_uri=src.as_uri(),
            ))
            print(dst)
        try:
            scale(src, args.width, args.height, dst)

        except Exception as exc:  # noqa
            print(f"Error resizing SVG: src={src}, dst={dst}: {exc}")


if __name__ == "__main__":
    sys.exit(main())
