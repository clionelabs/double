#!/usr/bin/env bash
set -e;
filename=$1;
heroku config:set METEOR_SETTINGS="$(cat ${filename})" --app askdouble;
exit 0;
