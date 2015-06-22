Template.assistantCustomersDashboard.helpers({
  getCurrentCustomer() {
    let rawUser = Session.get(SessionKeys.CURRENT_CUSTOMER);
    return rawUser ? _.extend(rawUser, Customer, User) : EmptyCustomer;
  },
  getSortedCustomers() {
    let customers = Users.findCustomers().fetch();

    let customersLastRepliedMap = _.reduce(customers, (memo, customer) => {
      let myDChannels = D.Channels.find({ customerId : customer._id }).fetch();
      let myDChannelWithLatestReplied
          = _.max(myDChannels, function(channel) { return channel.lastMessageTimestamp(); });
      memo[customer._id] = myDChannelWithLatestReplied.lastMessageTimestamp();
      return memo;
    }, {});

    customers = _.map(customers, function(customer) {
      return _.extend(customer, { lastMessageTimestamp : customersLastRepliedMap[customer._id]});
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
