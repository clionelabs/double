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
    const minuteRate = data.minuteRate;
    const creditMs = data.creditMs;

    let userId = Users.createCustomer({
      email: email,
      password: Meteor.uuid(),
      profile: {
        firstname: firstname,
        lastname: lastname,
        minuteRate: minuteRate,
        creditMs: creditMs,
        plan: plan
      }
    });

    if (data.billingEmail) {
      Accounts.addEmail(userId, data.billingEmail);
      Meteor.users.update(userId, { $set : { 'emails.1.isBilling' : true }});
    }

    if (Meteor.settings.defaultAccountPassword) {
      Accounts.setPassword(userId, Meteor.settings.defaultAccountPassword);
    }
  },
  editCustomer(userId, data) {
    const email = data.email;
    const firstname = data.firstname;
    const lastname = data.lastname;
    const minuteRate = data.minuteRate;
    const creditMs = data.creditMs;
    const planId = data.planId;

    Users.editCustomer(userId,
        {
          firstname: firstname,
          lastname: lastname,
          minuteRate: minuteRate,
          creditMs: creditMs,
          billingEmail: data.billingEmail
        });
    const currentPlan = Users.findOneCustomer(userId).currentPlan();
    if (planId !== currentPlan._id) {
      Subscriptions.change(planId, userId);
    }
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

  chargeInvoice(invoice) {
    InvoicePayment.issueInvoice(invoice._id);
  },

  chargeOneTimePurchase(oneTimePurchase, taskId) {
    Tasks.OneTimePurchases.Payment.charge(oneTimePurchase._id, taskId);
  },

  generateInvoicesFor(date) {
    if (Users.isAdmin(Meteor.userId())) {
      return Invoices.Generator.generateForUsersDue(date || moment().valueOf());
    } else {
      return null;
    }
  }

});
