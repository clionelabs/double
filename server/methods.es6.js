Meteor.methods({
  createAssistant: function(data) {
    let email = data.email;
    let firstname = data.firstname;
    let lastname = data.lastname;
    let url = data.url;

    let userId = Users.createAssistant({
      email: email,
      password: Meteor.uuid(),
      profile: {
        firstname: firstname,
        lastname: lastname,
        url: url
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
    let plan = data.plan;

    let userId = Users.createCustomer({
      email: email,
      password: Meteor.uuid(),
      profile: {
        firstname: firstname,
        lastname: lastname,
        plan : plan
      }
    });

    if (Meteor.settings.defaultAccountPassword) {
      Accounts.setPassword(userId, Meteor.settings.defaultAccountPassword);
    }
  },
  editCustomer: function(userId, data) {
    let email = data.email;
    let firstname = data.firstname;
    let lastname = data.lastname;
    let plan = data.plan;

    Users.editCustomer(userId,
    {
      profile: {
        firstname: firstname,
        lastname: lastname,
        plan : plan
      }
    });
  },

  // TODO: Temporary for testing.
  //   To generate a login link, execute `Meteor.call('generateLoginLink', USER_ID)` on browser, then check the server log for login url
  generateLoginLink: function(userId) {
    let id = LoginLinks.create(userId);
    var doc = LoginLinks.findOne(id);
    var url = Router.routes.secretLogin.url({secret: doc.secret});
    console.log("url: ", url);
  }
});
