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

Meteor.publish('myTasks', function() {
  return Tasks.find();
});

Meteor.publish('myInProcessTasks', function() {
  let selector = { completedAt : null };
  return Tasks.find(selector);
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
    return [];
  }
});

Meteor.publish('unroutedChannels', function() {
  if (!(Users.isAssistant(this.userId) || Users.isAdmin(this.userId))) {
    return [];
  }
  return D.Channels.find({customerId: {$exists: false}});
});

Meteor.publish('routedChannels', function() {
  if (!(Users.isAssistant(this.userId) || Users.isAdmin(this.userId))) {
    return [];
  }
  return D.Channels.find({customerId: {$exists: true}});
});

Meteor.publish('channelMessagesSorted', function(channelId, limit = 10) {
  if (!(Users.isAssistant(this.userId) || Users.isAdmin(this.userId))) {
    return null;
  }
  return [
    D.Messages.find({ channelId: channelId }, { limit : +limit, sort : { timestamp : -1 }})
  ];
});

Meteor.publish('taskTaggedMessages', function(taskId) {
  if (!(Users.isAssistant(this.userId) || Users.isAdmin(this.userId))) {
    return null;
  }
  return [
    D.Messages.find({ taggedTaskIds: {$in: [taskId]} })
  ];
});

Meteor.publish("invoices", function() {
  if (!(Users.isAssistant(this.userId) || Users.isAdmin(this.userId))) {
    return null;
  } else {
    return Invoices.find();
  }
});

Meteor.publish("configs", function() {
  return D.Configs.find();
});
