Template.assistantCustomersDashboard.helpers({
  getCurrentCustomer() {
    let rawUser = Session.get(SessionKeys.CURRENT_CUSTOMER);
    return rawUser ? _.extend(rawUser, Customer, User) : EmptyCustomer;
  },
  getSortedCustomers() {
    let customers = Users.findCustomers().fetch();
    let myDChannels = D.Channels.find({ customerId : { $in : _.pluck(customers, '_id') }}).fetch();
    myDChannels = _.sortBy(myDChannels, function(channel) { return channel.lastMessageTimestamp(); }).reverse();
    let customersWithKeys = _.reduce(customers, function(memo, c) {
      let customerWithKeys = {};
      customerWithKeys[c._id] = c;
      return _.extend(memo, customerWithKeys);
    }, {});
    return _.reduce(myDChannels, function(memo, channel) {
      let customerWithLastMessageTimestamp
          = _.extend(customersWithKeys[channel.customerId],
              { lastMessageTimestamp : channel.lastMessageTimestamp() });
      memo.push(customerWithLastMessageTimestamp);
      return memo;
    }, []);

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
