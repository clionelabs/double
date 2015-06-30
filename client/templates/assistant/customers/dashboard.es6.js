Template.assistantCustomersDashboard.helpers({
  getCurrentCustomer() {
    return this.currentCustomer;
  },
  getSortedCustomers() {
    let currentCustomer = this.currentCustomer;
    let customers = this.customers.fetch();
    customers = _.map(customers, (customer) => {
      let lastMessageTimestamp = null;
      let myDChannels = D.Channels.find({ customerId : customer._id }).fetch();
      if (!_.isEmpty(myDChannels)) {
        let myDChannelWithLatestReplied
            = _.max(myDChannels, function (channel) {
          return channel.lastMessageTimestamp();
        });
        lastMessageTimestamp = myDChannelWithLatestReplied.lastMessageTimestamp();
      }
      return _.extend(customer,
          {
            lastMessageTimestamp :  lastMessageTimestamp,
            isCurrent : (customer._id === currentCustomer._id)
          });
    });
    return _.sortBy(customers, function(customer) { return -1 * customer.lastMessageTimestamp; });
  },
  getTasksOfSelectedCustomer() {
    let currentCustomer = this.currentCustomer;
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
