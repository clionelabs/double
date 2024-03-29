let setupIndexes = function() {
  D.Messages._ensureIndex({channelId: 1});
}

let setupChannelURLs = function() {
  // TODO: fix unbound result set in observe
  D.Channels.find().observe({
    added: function(channel) {
      let dashboardURL = Router.routes['channel.default'].url({_id: channel._id});
      D.Channels.update({_id: channel._id}, {$set: {dashboardURL: dashboardURL}});
    }
  });
}

Meteor.startup(() => {
  if (Meteor.settings.adminAccount) {
    let email = Meteor.settings.adminAccount.email;
    let password = Meteor.settings.adminAccount.password;

    if (!Meteor.users.findOne({ emails: { $elemMatch: { address: email }}})) {
      Users.createAdmin({
        email: email,
        password: password,
        profile: {}
      });
    }
  }

  Accounts.validateNewUser((user) => {
    if (Users.isAdmin(Meteor.userId())) {
      return true;
    }
    throw new Meteor.Error(403, "Not authorized to create new user");
  });

  // Register custom login method using secret link
  Accounts.registerLoginHandler(LoginLinks.loginHandler);

  SyncedCron.start();

  TaskSchedulers.startup();

  InvoicePayment.startup();
  Tasks.OneTimePurchases.Payment.startup();

  DoubleFastRender.startup();

  setupIndexes();

  setupChannelURLs();

  Feedbacks.startup();

  Tasks.startup();
});
