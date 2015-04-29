Meteor.reactivePublish('assistants', function() {
  if (Users.isAdmin(this.userId)) {
    return Users.findAssistants();
  } else if (Users.isCustomer(this.userId)) {
    let placements = Placements.find({customerId: this.userId}, {fields: {assistantId: 1}, reactive: true}).fetch();
    let assistantIds = _.pluck(placements, 'assistantId');
    return Users.findAssistants({ _id : { $in : assistantIds }});
  } else {
    return []
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
    let placements = Placements.find({assistantId: this.userId}, {fields: {customerId: 1}, reactive: true}).fetch();
    let customerIds = _.pluck(placements, 'customerId');
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
