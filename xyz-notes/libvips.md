####links

[libvips](https://libvips.github.io/libvips/)

[GitHub](https://github.com/libvips/libvips)

[arm64-ubuntu20.4](https://ubuntu.pkgs.org/20.04/ubuntu-universe-arm64/libvips-dev_8.9.1-2_arm64.deb.html)

[Can't compile under arm64](https://github.com/lovell/sharp/issues/2460)

- Required dependencies:

> sudo apt install gcc make autoconf automake  
> sudo apt install build-essential pkg-config libglib2.0-dev libexpat1-dev expat gobject-introspection  
> sudo apt install libtiff5-dev libjpeg-turbo8-dev libgsf-1-dev

- Unpacking the [archive](https://github.com/libvips/libvips/releases):
> tar xf libvips-8.12.1.tar.gz

- For arm-based
> 

- Install:
> cd libvips-8.12.1  
./configure  
make  
sudo make install  
sudo ldconfig

or

> sudo apt install libvips-dev
