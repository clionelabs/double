Meteor.startup(function() {
  if (Meteor.settings.adminAccount) {
    var email = Meteor.settings.adminAccount.email;
    var password = Meteor.settings.adminAccount.password;

    if (!Meteor.users.findOne({emails: {$elemMatch: {address: email}}})) {
      var userId = Users.createAdmin({
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
});
