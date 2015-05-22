Template.assistantDashboard.onCreated(function() {

});
Template.assistantDashboard.helpers({
  myCustomers() {
    let users = this.placements.map(function(placement) {
      return Users.findOne(placement.customerId);
    });
    return users;
  },
  myCurrentCustomer() {
    if (!Session.get(SessionKeys.CURRENT_CUSTOMER)) {
      Session.setAuth(SessionKeys.CURRENT_CUSTOMER, Users.findCustomers().fetch()[0]);
    }
    return _.extend(Session.get(SessionKeys.CURRENT_CUSTOMER), User);
  },
  getTasksOfSelectedCustomer() {
    return Tasks.findRequestedBy(Template.assistantDashboard.__helpers.get("myCurrentCustomer")()._id);
  }

});
