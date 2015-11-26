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
    const hourlyRate = data.hourlyRate;
    const creditMs = data.creditMs;

    let userId = Users.createCustomer({
      email: email,
      password: Meteor.uuid(),
      profile: {
        firstname: firstname,
        lastname: lastname,
        hourlyRate: hourlyRate,
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
    const hourlyRate = data.hourlyRate;
    const creditMs = data.creditMs;
    const planId = data.planId;

    Users.editCustomer(userId,
        {
          firstname: firstname,
          lastname: lastname,
          hourlyRate: hourlyRate,
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
    invoice = Invoice.transform(invoice);
    Invoice.StateMachine(invoice);
    console.log(Invoice.Prototype);

    let data = {
      invoiceId: invoice._id,
      customerId: invoice.customerId,
      amount: invoice.debit().toFixed(2),
      type : Transaction.Type.INVOICE
    };
    D.Events.create('newTransaction', data); // call double.pay to create a transaction
    invoice.issue();
  },

  chargeOneTimePurchase(oneTimePurchase) {
    _.extend(oneTimePurchase, Tasks.OneTimePurchase.ProtoType);
    Tasks.OneTimePurchase.StateMachine(oneTimePurchase);

    const task = Tasks.findOne(oneTimePurchase.taskId);
    let data = {
      customerId : task.requestorId,
      oneTimePurchaseId: oneTimePurchase._id,
      taskId: oneTimePurchase.taskId,
      amount: oneTimePurchase.totalAmount(),
      type : Transaction.Type.ONE_TIME_PURCHASE
    };

    D.Events.create('newTransaction', data); // call double.pay to create a transaction
    oneTimePurchase.transactionCreated();
    Meteor.call('slackOtpTransactionCreated', oneTimePurchase);
  },

  generateInvoicesFor(date) {
    if (Users.isAdmin(Meteor.userId())) {
      return Invoices.Generator.generateForUsersDue(date || moment().valueOf());
    } else {
      return null;
    }
  },

  slackOtpTransactionCreated(oneTimePurchase) {
    const task = Tasks.findOne(oneTimePurchase.taskId);
    SlackLog.log('_one_time_charge', {

      text: `
One Time Charge ${oneTimePurchase.title} of ${task.title} is charging.
`,
      username: 'Double A.I. Parts 2',
      unfurl_links: true,
      icon_emoji: ':robot_face:'
    });
  },
  slackOtpTransactionSucceed(oneTimePurchase) {
    const task = Tasks.findOne(oneTimePurchase.taskId);
    SlackLog.log('_one_time_charges', {

      text: `
One Time Charge ${oneTimePurchase.title} of ${task.title} is successfully charged.
`,
      username: 'Double A.I. Parts 2',
      unfurl_links: true,
      icon_emoji: ':robot_face:'
    });
  },
  slackOtpTransactionVoided(oneTimePurchase) {
    const task = Tasks.findOne(oneTimePurchase.taskId);
    SlackLog.log('_one_time_charges', {

      text: `
One Time Charge ${oneTimePurchase.title} of ${task.title} is voided.
`,
      username: 'Double A.I. Parts 2',
      unfurl_links: true,
      icon_emoji: ':robot_face:'
    });
  },
  slackOtpTransactionFailed(oneTimePurchase) {
    const task = Tasks.findOne(oneTimePurchase.taskId);
    const url =  Router['assistant.tasks'].url({
      _id : taskId
    });
SlackLog.log('_one_time_charges', {

      text: `
INSPECTION NEEDED:
One Time Charge ${oneTimePurchase.title} of ${task.title} has failed.
${url}
`,
      username: 'Double A.I. Parts 2',
      unfurl_links: true,
      icon_emoji: ':robot_face:'
    });
  },
});
