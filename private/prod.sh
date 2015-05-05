set -e;
heroku config:set METEOR_SETTINGS="$(cat settings.json)" --app askdouble;
cd ..;
git push heroku master;
exit 0;
