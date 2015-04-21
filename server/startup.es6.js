Meteor.startup(function() {
  if (Meteor.settings.adminAccount) {
    let email = Meteor.settings.adminAccount.email;
    let password = Meteor.settings.adminAccount.password;

    if (!Meteor.users.findOne({emails: {$elemMatch: {address: email}}})) {
      let userId = Users.createAdmin({
        email: email,
        password: password
      });
    }
  }

  Accounts.validateNewUser(function (user) {
    if (Users.isAdmin(Meteor.userId())) {
      return true;
    }
    throw new Meteor.Error(403, "Not authorized to create new user");
  });

  Accounts.registerLoginHandler(LoginTokens.loginHandler);
});
