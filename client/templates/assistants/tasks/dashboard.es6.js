Template.assistantDashboard.helpers({
  myCustomers() {
    return this.placements.map(function(placement) {
      return Users.findOne(placement.customerId);
    });
  },
  myCurrentCustomer() {
    return _.extend(Session.get(SessionKeys.CURRENT_CUSTOMER), User);
  },
  getTasksOfSelectedCustomer() {
    return Tasks.findRequestedBy(Template.assistantDashboard.__helpers.get("myCurrentCustomer")()._id);
  }

});
