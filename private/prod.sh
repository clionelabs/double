set -e;
filename=$1;
heroku config:set METEOR_SETTINGS="$(cat $filename)" --app askdouble;
git push heroku master;
exit 0;
