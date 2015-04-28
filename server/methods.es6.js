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

  createTaskScheduler: function(data) {
    let doc = {
      title: data.title,
      ruleString: data.ruleString,
      requestorId: data.customerId,
      responderId: Meteor.userId()
    }
    TaskSchedulers.create(doc);
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
