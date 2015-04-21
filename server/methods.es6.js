Meteor.methods({
  createAssistant: function(data) {
    let email = data.email;
    let firstname = data.firstname;
    let lastname = data.lastname;

    let userId = Users.createAssistant({
      email: email,
      password: Meteor.uuid(),
      profile: {
        firstname: firstname,
        lastname: lastname
      }
    });

    if (Meteor.settings.defaultAccountPassword) {
      Accounts.setPassword(userId, Meteor.settings.defaultAccountPassword);
    }
  },

  createCustomer: function(data) {
    let email = data.email;
    let firstname = data.firstname;
    let lastname = data.lastname;

    let userId = Users.createCustomer({
      email: email,
      password: Meteor.uuid(),
      profile: {
        firstname: firstname,
        lastname: lastname
      }
    });

    if (Meteor.settings.defaultAccountPassword) {
      Accounts.setPassword(userId, Meteor.settings.defaultAccountPassword);
    }
  },

  // TODO: Temporary for testing.
  //   To generate a login token, execute `Meteor.call('generateLoginToken', USER_ID)` on browser, then check the server log for login url
  generateLoginToken: function(userId) {
    let secret = LoginTokens.create(userId);
    console.log("secret: ", secret);
    return secret;
  }
});
