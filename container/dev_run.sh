#!/bin/sh

set -xe

# Output that can be useful for debugging
echo "USER: ${UID}"
echo "GROUP: ${GID}"

# Remove event directories that can cause fails like:
# s6-supervise <service name>: fatal: unable to mkfifodir event: Permission denied
rm -rf "$(find /etc/s6.d -name 'event')"


if [ -n "${SUBPATH}" ]; then
  ln -sfn /etc/nginx/nginx-subpath.conf /etc/nginx/nginx.conf
  sed -i -e "s|@SUBPATH@|${SUBPATH}|g" /etc/nginx/nginx.conf
  sed -i -e "s|href=\"|href=\"${SUBPATH}|g" /scowport/public/index.html
  sed -i -e "s|src=\"|src=\"${SUBPATH}|g" /scowport/public/index.html
else
  ln -sfn /etc/nginx/nginx-root.conf /etc/nginx/nginx.conf
fi

chown -R "$UID:$GID" /scowport /etc/s6.d /etc/nginx /var/lib/nginx /var/log /run/nginx
su-exec "$UID:$GID" /usr/bin/s6-svscan /etc/s6.d