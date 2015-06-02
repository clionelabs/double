Template.assistantCustomersDashboard.helpers({
  getCurrentCustomer() {
    return _.extend(Session.get(SessionKeys.CURRENT_CUSTOMER), Customer, User);
  }
});

Template.assistantCustomersDashboard.events({
  "click .new-task-button": function() {
    let currentCustomer = Template.assistantCustomersDashboard.__helpers.get('getCurrentCustomer')();
    let data = {
      customerId: currentCustomer._id
    };
    Modal.show('assistantCreateTask', data);
  }
});
