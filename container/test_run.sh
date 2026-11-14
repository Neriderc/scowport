#!/bin/sh

set -xe

# Output that can be useful for debugging
echo "USER: ${UID}"
echo "GROUP: ${GID}"
echo "TEST EXECUTION"

# Remove event directories that can cause fails like:
# s6-supervise <service name>: fatal: unable to mkfifodir event: Permission denied
rm -rf "$(find /etc/s6.d -name 'event')"

ln -sfn /etc/nginx/nginx-test.conf /etc/nginx/nginx.conf

chown -R "$UID:$GID" /scowport /etc/s6.d /etc/nginx /var/lib/nginx /var/log /run/nginx
su-exec "$UID:$GID" /usr/bin/s6-svscan /etc/s6.d