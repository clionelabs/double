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
});
