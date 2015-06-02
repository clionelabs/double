Template.assistantCustomersDashboard.helpers({
  getCurrentCustomer() {
    return _.extend(Session.get(SessionKeys.CURRENT_CUSTOMER), Customer, User);
  }
});
