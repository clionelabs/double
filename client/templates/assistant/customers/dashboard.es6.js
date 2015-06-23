Template.assistantCustomersDashboard.helpers({
  getCurrentCustomer() {
    let rawUser = Session.get(SessionKeys.CURRENT_CUSTOMER);
    return rawUser ? _.extend(rawUser, Customer, User) : EmptyCustomer;
  },
  getSortedCustomers() {
    let customers = Users.findCustomers().fetch();

    customers = _.map(customers, (customer) => {
      let myDChannels = D.Channels.find({ customerId : customer._id }).fetch();
      let myDChannelWithLatestReplied
          = _.max(myDChannels, function(channel) { return channel.lastMessageTimestamp(); });
      return _.extend(customer, { lastMessageTimestamp : myDChannelWithLatestReplied.lastMessageTimestamp() });
    });

    return _.sortBy(customers, function(customer) { return -1 * customer.lastMessageTimestamp; });

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
