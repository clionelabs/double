Meteor.publish('assistants', function() {
  if (Users.isAdmin(this.userId)) {
    return Users.findAssistants();
  } else {
    this.ready();
  }
});

Meteor.publish('customers', function() {
  if (Users.isAdmin(this.userId)) {
    return Users.findCustomers();
  } else {
    this.ready();
  }
});
