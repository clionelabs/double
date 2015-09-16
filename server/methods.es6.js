Meteor.methods({
  createAssistant(data) {
    if (!Users.isAdmin(Meteor.userId())) return;

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

  createCustomer(data) {
    if (!Users.isAdmin(Meteor.userId())) return;

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
        plan: plan
      }
    });

    if (Meteor.settings.defaultAccountPassword) {
      Accounts.setPassword(userId, Meteor.settings.defaultAccountPassword);
    }
  },
  editCustomer(userId, data) {
    let email = data.email;
    let firstname = data.firstname;
    let lastname = data.lastname;
    let hourlyRate = data.hourlyRate;
    let creditMs = data.creditMs;

    Users.editCustomer(userId,
        {
          profile: {
            firstname: firstname,
            lastname: lastname,
            hourlyRate: hourlyRate,
            creditMs: creditMs
          }
        });
  },

  requestLoginAccess(email) {
    let user = Meteor.users.findOne({ emails: { $elemMatch: { address: email }}});
    if (!user) {
      throw Meteor.Error("user not found", "");
    }
    LoginLinks.createAndSendAccess(user);
  },

  requestLoginAccessWithOldSecret(secret) {
    let oldLink = LoginLinks.findOne({ secret: secret });
    if (!oldLink) {
      throw Meteor.Error("secret not found", "");
    }
    let user = Meteor.users.findOne(oldLink.userId);
    LoginLinks.createAndSendAccess(user);
  },

  tagTask(messageIds, taskId) {
    return Messages.tagTask(messageIds, taskId);
  },

});
