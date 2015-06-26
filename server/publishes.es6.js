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

Meteor.reactivePublish('customers', function() {
  let selector = {};
  if (!Users.isAdmin(this.userId)) {
    let myPlacements = Placements.find({assistantId: this.userId}).fetch();
    let myCustomerIds = _.pluck(myPlacements, 'customerId');
    selector = { _id : { $in :  myCustomerIds }};
  }
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

Meteor.reactivePublish('unroutedChannels', function() {
  if (!(Users.isAssistant(this.userId) || Users.isAdmin(this.userId))) {
    return [];
  }
  let channels = D.Channels.find({customerId: {$exists: false}}).fetch();
  let channelIds = _.pluck(channels, '_id');
  let messageIds = _.reduce(channels, function(memo, channel) {
    let lastMessage = channel.lastMessage();
    if (lastMessage) memo.push(lastMessage._id);
    return memo;
  }, []);
  return [
    D.Channels.find({_id: {$in: channelIds}}),
    D.Messages.find({_id: {$in: messageIds}})
  ];
});

Meteor.reactivePublish('routedChannels', function() {
  if (!(Users.isAssistant(this.userId) || Users.isAdmin(this.userId))) {
    return [];
  }
  let channels = D.Channels.find({customerId: {$exists: true}}).fetch();
  let channelIds = _.pluck(channels, '_id');
  let messageIds = _.reduce(channels, function(memo, channel) {
    let lastMessage = channel.lastMessage();
    if (lastMessage) memo.push(lastMessage._id);
    return memo;
  }, []);
  return [
    D.Channels.find({_id: {$in: channelIds}}),
    D.Messages.find({_id: {$in: messageIds}})
  ];
});

Meteor.publish('channelMessagesSorted', function(channelId, limit = 10) {
  if (!(Users.isAssistant(this.userId) || Users.isAdmin(this.userId))) {
    return [];
  }
  return [
    D.Messages.find({ channelId: String(channelId) }, { limit : +limit, sort : { timestamp : -1 }})
  ];
});
