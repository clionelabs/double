Meteor.reactivePublish('assistants', function() {
  if (Users.isAdmin(this.userId)) {
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

Meteor.publish('inProcessTasks', function() {
  return Tasks.find({ completedAt : null });
});

Meteor.reactivePublish('customers', function() {
  return Users.findCustomers();
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

Meteor.reactivePublish('unroutedChannels', function() {
  if (!Users.isAssistant(this.userId)) {
    return [];
  }
  let channels = D.Channels.find({customerId: {$exists: false}}).fetch();
  let channelIds = _.pluck(channels, '_id');
  return [
    D.Channels.find({_id: {$in: channelIds}}),
    D.Messages.find({channelId: {$in: channelIds}})
  ];
});

Meteor.reactivePublish('routedChannels', function() {
  if (!Users.isAssistant(this.userId)) {
    return [];
  }
  let channels = D.Channels.find({customerId: {$exists: true}}).fetch();
  let channelIds = _.pluck(channels, '_id');
  return [
    D.Channels.find({_id: {$in: channelIds}}),
    D.Messages.find({channelId: {$in: channelIds}})
  ];
});
