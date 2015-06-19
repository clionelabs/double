Template.assistantCustomersDashboard.helpers({
  getCurrentCustomer() {
    let rawUser = Session.get(SessionKeys.CURRENT_CUSTOMER);
    return rawUser ? _.extend(rawUser, Customer, User) : EmptyCustomer;
  },
  getTasksOfSelectedCustomer() {
    let currentCustomer = Template.assistantCustomersDashboard.__helpers.get("getCurrentCustomer")();
    return Tasks.findRequestedBy(currentCustomer._id);
  }
});

Template.assistantCustomersDashboard.events({
  "click .new-task-button": function() {
    let currentCustomer = Template.assistantCustomersDashboard.__helpers.get('getCurrentCustomer')();
    let data = {
      customerId: currentCustomer._id
    };
    Modal.show('assistantTaskCreate', data);
  }
});
