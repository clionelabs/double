var myCurrentCustomer = function() {
  if (!Session.get("currentCustomer")) {
    Session.set("currentCustomer", Users.findCustomers().fetch()[0]);
  }
  return _.extend(Session.get("currentCustomer"), User);
};

Template.assistantDashboard.helpers({
  myCustomers: function() {
    let users = this.placements.map(function(placement) {
      return Users.findOne(placement.customerId);
    });
    return users;
  },
  myCurrentCustomer : myCurrentCustomer
});
