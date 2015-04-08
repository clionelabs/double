Meteor.publish('assistants', function() {
  if (Users.isAdmin(this.userId)) {
    return Users.findAssistants();
  } else {
    return [];
  }
});

Meteor.publish('customers', function() {
  if (Users.isAdmin(this.userId)) {
    return Users.findCustomers();
  } else if (Users.isAssistant(this.userId)) {
    return Users.findCustomers();
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
