# Overview

Double system adapts a micro-services architecture and consists of the following 3 main components.

1. dashboard

  https://github.com/clionelabs/double
2. pay

  https://github.com/clionelabs/double.pay
3. services 

  https://github.com/clionelabs/double.services
  
  https://github.com/clionelabs/double.services.telegram

Each repositories are an independent meteor applications. Although they can be run independently, it's expected that they will be connected to the same underlying mongodb to make sense of their functionalities. 

# Local testing
To test the whole system on your local machine, execute the following steps:

1) Start dashboard app
* in the `double` repository, execute `meteor --settings=SETTINGS_FILE`

2) Start pay app, pointing to the same mongodb started earlier
* in the `double.pay` repository, execute `MONGODB=mongodb://127.0.0.1:3001/meteor meteor --settings=SETTINGS_FILE --port=3002`

3) Start services app, pointing to the same mongodb started earlier
* in the `double.services` repository, execute `MONGODB=mongodb://127.0.0.1:3001/meteor meteor --settings=SETTINGS_FILE --port=3004`

4) Start services.telegram app, pointing to the same mongodb started earlier.  

* To run services.telegram app properly, we also need to expose a public url for receiving webhook trigger from telegram. To do so, download and install ngrok - https://ngrok.com
* run ngrok and pointing to port 3006, i.e. `./ngrok http 3006`, now you should receive a forwarding for your local port 3006 (e.g. `Forwarding http://517ae74b.ngrok.io -> localhost:3006 `), and let's call it MAPPED_URL (e.g. `http://517ae74b.ngrok.io`)
* in the `double.services.telegram` repository, execute `ROOT_URL=MAPPED_URL MONGODB=mongodb://127.0.0.1:3001/meteor meteor --settings=SETTINGS_FILE --port=3006`

#### Notes
* If you only need to do development on dashboard, you normally need only to execute step 1).
* If you need to do development on payment authorization, you normally need only to execute step 1) and 2).
* If you need to do development on communication channels (e.g. slack), you normally need to execute step 1) and 3).
* If you need to do development on the telegram communication channels, you need to execute step 1, 3 and 4.

* <strong>General rule, you need to execute step 1) almost everytime, and depends on the features you work on, start the relevant applications</strong>

#### Other Notes
for sample SETTINGS_FILE, refer to `private/settings.sample.json` under each of the repositories.

# Deployements

There are many ways to deploy the whole system. In general, the three major steps are:

1) Create a mongodb instance. One easy way is to use hosted database service, e.g. mongolab - http://mongolab.com/

2) Deploy each of the meteor applications above (4 in total, `double`, `double.pay`, `double.services`, `double.services.telegram`). One easy way is to use hosted service, e.g. heroku - http://heroku.com

  * a third party buildpack for deploying meteor apps on heroku platform: https://github.com/jordansissel/heroku-buildpack-meteor

3) Update application settings for each of the applications deployed in step 2). One important configuration is the mongodb url, i.e. `MONGO_URL`. Make sure it is pointing to the mongodb instance created on step 1)


