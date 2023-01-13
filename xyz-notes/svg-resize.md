[inkscape-resize](https://graphicdesign.stackexchange.com/questions/6574/in-inkscape-resize-both-the-document-and-its-content-at-the-same-time/6670#6670)

You haven't mentioned what OS you're running. I'm using Ubuntu, and I've been able
to use librsvg2 successfully. If you have access to Ubuntu, here's what you can do.
First, install librsvg2:
````
sudo apt install librsvg2-bin
````

Then, cd to the directory that has your SVGs (make sure it only has SVGs)
and use a command like the following:
````
for old in *; do
    new="$(echo "$old" | sed -e 's/svg$/new.svg/')"
    rsvg-convert "$old" -w 160 -h 160 -f svg -o "$new"
done
````

This will create a new batch of SVGs with dimensions 200px by 200px,
and saved as "original-file-name.new.svg"

Calculating dimensions is somewhat confusing. For converting SVG to SVG,
you need to do a little bit of math. The "height" and "width" options in rsvg-convert
use pt, not px, in such cases, so use 80 if you want 100px, 120 if you want 150px,
and so on.

You can also use rsvg-convert to output PNGs. It is much better at rasterizing the file
than ImageMagick, at least in my experience. Notice that you need to change -f to png,
you need to change the output save pattern from 's/svg$/new.svg/' to 's/svg$/png/',
and you enter the width and height that you want as the pixel values.
````
for old in *; do
    new="$(echo "$old" | sed -e 's/svg$/png/')"
    rsvg-convert "$old" -w 200 -h 200 -f png -o "$new"
done
````

Point-to-pixel ratios

76  -  95  
80  - 100  
120 - 150  
140 - 175  
144 - 180  
160 - 200  
180 - 225  
200 - 250  
300 - 375  
320 - 400  
