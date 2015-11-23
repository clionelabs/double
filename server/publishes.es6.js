Meteor.reactivePublish('assistants', function() {
  if (Users.isAdmin(this.userId) || Users.isAssistant(this.userId)) {
    return Users.findAssistants();
  } else if (Users.isCustomer(this.userId)) {
    let placements = Placements.find(
        { customerId: this.userId },
        { fields: { assistantId: 1 }, reactive: true }
    ).fetch();
    let assistantIds = _.pluck(placements, 'assistantId');
    return Users.findAssistants({ _id : { $in : assistantIds }});
  } else {
    return [];
  }
});

Meteor.publish('tags', function() {
  return Tags.find();
});

Meteor.publish('customerTasks', function(customerId) {
  if (!(Users.isAssistant(this.userId) || Users.isAdmin(this.userId))) {
    return [];
  }
  return Tasks.find({requestorId: customerId});
});

Meteor.publish('customerSubscriptions', function(customerId) {
  if (!(Users.isAssistant(this.userId) || Users.isAdmin(this.userId))) {
    return [];
  }
  return Subscriptions.find({customerId: customerId});
});

Meteor.publish("customerInvoices", function(customerId) {
  if (!(Users.isAssistant(this.userId) || Users.isAdmin(this.userId))) {
    return [];
  }
  return Invoices.find({customerId: customerId});
});

Meteor.publish("tasks", function(selector, options) {
  if (!(Users.isAssistant(this.userId) || Users.isAdmin(this.userId))) {
    return [];
  }
  return Tasks.find(selector, options);
});

Meteor.publish('myTasks', function() {
  if (!(Users.isAssistant(this.userId) || Users.isAdmin(this.userId))) {
    return [];
  }
  return Tasks.find();
});

Meteor.publish('customers', function() {
  let selector = {};
  return Users.findCustomers(selector);
});

Meteor.publish('placements', function() {
  if (Users.isAdmin(this.userId)) {
    return Placements.find();
  } else if (Users.isAssistant(this.userId)) {
    return Placements.find({ assistantId: this.userId });
  } else {
    //return empty array coz return null will not terminate waitOn in prod
    return [];
  }
});

Meteor.publish('unroutedChannels', function() {
  if (!(Users.isAssistant(this.userId) || Users.isAdmin(this.userId))) {
    //return empty array coz return null will not terminate waitOn in prod
    return [];
  }
  return D.Channels.find({customerId: {$exists: false}});
});

Meteor.publish('routedChannels', function() {
  if (!(Users.isAssistant(this.userId) || Users.isAdmin(this.userId))) {
    //return empty array coz return null will not terminate waitOn in prod
    return [];
  }
  return D.Channels.find({customerId: {$exists: true}});
});

Meteor.publish('channelMessagesSorted', function(channelId, limit = 10) {
  if (!(Users.isAssistant(this.userId) || Users.isAdmin(this.userId))) {
    //return empty array coz return null will not terminate waitOn in prod
    return [];
  }
  return [
    D.Messages.find({ channelId: channelId }, { limit : +limit, sort : { timestamp : -1 }})
  ];
});

Meteor.publish('taskTaggedMessages', function(taskId) {
  if (!(Users.isAssistant(this.userId) || Users.isAdmin(this.userId))) {
    //return empty array coz return null will not terminate waitOn in prod
    return [];
  }
  return [
    D.Messages.find({ taggedTaskIds: {$in: [taskId]} })
  ];
});

Meteor.publish("invoices", function() {
  if (!(Users.isAssistant(this.userId) || Users.isAdmin(this.userId))) {
    //return empty array coz return null will not terminate waitOn in prod
    return [];
  } else {
    return Invoices.find();
  }
});

Meteor.publish('feedbacks', function() {
  if (!(Users.isAdmin(this.userId))) {
    //return empty array coz return null will not terminate waitOn in prod
    return [];
  } else {
    return Feedbacks.find();
  }
});

Meteor.publish('plans', function() {
  if (!(Users.isAssistant(this.userId) || Users.isAdmin(this.userId))) {
    //return empty array coz return null will not terminate waitOn in prod
    return [];
  }
  return Plans.find();
});

Meteor.publish('subscriptions', function() {
  if (!(Users.isAssistant(this.userId) || Users.isAdmin(this.userId))) {
    //return empty array coz return null will not terminate waitOn in prod
    return [];
  }
  return Subscriptions.find();
});

Meteor.publish("configs", function() {
  return D.Configs.find();
});

Meteor.publish("currentUser", function() {
  if (Meteor.userId()) {
    return Meteor.users.find(Meteor.userId());
  } else {
    //return empty array coz return null will not terminate waitOn in prod
    return [];
  }
});

Meteor.publish('invoiceOnly', function(invoiceId) {
  const invoice = Invoices.findOne(invoiceId);
  if (invoice) {
    return [
      Invoices.find(invoiceId),
      Users.findCustomers(invoice.customerId, { fields : Users.showDisplayOnlyOptions() })
    ];
  } else {
    //return empty array coz return null will not terminate waitOn in prod
    return [];
  }
});

