#!/usr/bin/env python3

from rembg.bg import remove
import base64
import sys

# input_path = sys.argv[1]
# output_path = sys.argv[2]

# parts = input_path.split('.')
# output_path = parts[0] + '-mod.' + parts[1]

# with open(input_path, 'rb') as i:
#     with open(output_path, 'wb') as o:
#         input = i.read()
#         output = remove(input)
#         o.write(output)

sys.stdout.buffer.write(remove(base64.b64decode(sys.stdin.buffer.read())))
# sys.stdout.buffer.write(base64.decodebytes(sys.stdin.buffer.read()))
# sys.stdout.buffer.write(str(len(sys.stdin.buffer.read())).encode())
# sys.stdout.buffer.write('TEST'.encode())
