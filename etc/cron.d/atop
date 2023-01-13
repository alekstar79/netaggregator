PATH=/bin:/usr/bin:/sbin:/usr/sbin

# daily restart of atop at midnight
0 0 * * * root if [ -d "/run/systemd/system" ]; then systemctl restart atop; else /usr/share/atop/atop.daily \& ; fi
