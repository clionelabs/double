Meteor.publish('assistants', function() {
  if (Users.isAdmin(this.userId)) {
    return Users.findAssistants();
  } else {
    return [];
  }
});

Meteor.publish('myTasks', function() {
  return Tasks.find({
    $or: [
      {responderId: this.userId},
      {requestorId: this.userId}
    ]
  });
});

Meteor.reactivePublish('customers', function() {
  if (Users.isAdmin(this.userId)) {
    return Users.findCustomers();
  } else if (Users.isAssistant(this.userId)) {
    var placements = Placements.find({assistantId: this.userId}, {fields: {customerId: 1}, reactive: true}).fetch();
    var customerIds = _.pluck(placements, 'customerId');
    return Users.findCustomers({_id: {$in: customerIds}});
  } else {
    return [];
  }
});

Meteor.publish('placements', function() {
  if (Users.isAdmin(this.userId)) {
    return Placements.find();
  } else if (Users.isAssistant(this.userId)) {
    return Placements.find({assistantId: this.userId});
  } else {
    return [];
  }
});
