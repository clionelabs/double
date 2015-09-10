Router.route('/payment', function() {
  let req = this.request;
  let res = this.response;
  try {
    let bt = BrainTreeConnect({
      //If you set an ENV variable for PRODUCTION you can dynamically change out sandbox and production
      environment: process.env.PRODUCTION && Braintree.Environment.Production || Braintree.Environment.Sandbox,
      merchantId: Meteor.settings.braintree.merchantId,
      publicKey:  Meteor.settings.braintree.publicKey,
      privateKey: Meteor.settings.braintree.privateKey
    });

    let challenge = req.query.bt_challenge;
    console.log("Incoming");
    if (challenge) {
      return res.end(bt.webhookNotification.verify(challenge));
    } else {

      //Decode the request and perform the needed logic for the type of request
      bt.webhookNotification.parse(
          req.body.bt_signature,
          req.body.bt_payload,
          function (err, webhookNotifiction) {
            console.log(webhookNotifiction);
            switch (webhookNotifiction.kind) {
              case "disbursement":

                break;
              default:
                break;
            }
          });
      res.end();
    }

    return res.end();

  } catch(error) {
    throw new Meteor.Error(1001, error.message);
  }
}, { where : 'server' });

Router.route('/settle', function() {
  let req = this.request;
  let res = this.response;

  try {
    let bt = BrainTreeConnect({
      //If you set an ENV variable for PRODUCTION you can dynamically change out sandbox and production
      environment: process.env.PRODUCTION && Braintree.Environment.Production || Braintree.Environment.Sandbox,
      merchantId: Meteor.settings.braintree.merchantId,
      publicKey:  Meteor.settings.braintree.publicKey,
      privateKey: Meteor.settings.braintree.privateKey
    });

    let noti = bt.webhookTesting.sampleNotification(Braintree.WebhookNotification.Kind.Disbursement, this.request.tid);
    bt.webhookNotification.parse(
        noti.bt_signature,
        noti.bt_payload,
        function (err, webhookNotifiction) {
          console.log(webhookNotifiction);
          switch (webhookNotifiction.kind) {

            default:
              break;
          }
        });

    return res.end();

  } catch(error) {
    throw new Meteor.Error(1001, error.message);
  }
}, { where : 'server'});
