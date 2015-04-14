var myCurrentCustomer = function() {
  if (!Session.get("currentCustomer")) {
    Session.set("currentCustomer", Users.findCustomers().fetch()[0]);
  }
  return _.extend(Session.get("currentCustomer"), User);
};

Template.assistantDashboard.helpers({
  myCustomers: function() {
    let template = this;
    console.log(template);
    let users = this.placements.map(function(placement) {
      return Users.findOne(placement.customerId);
    });
    let filterCurrentCustomer = function(user) {
      return myCurrentCustomer()._id !== user._id;
    };
    return _.filter(users, filterCurrentCustomer);
  },
  myCurrentCustomer : myCurrentCustomer

});
