Template.assistantCustomersDashboard.helpers({
  getCurrentCustomer() {
    return Router.current().data().currentCustomer;
  },
  getSortedCustomers() {
    let currentCustomer = Router.current().data().currentCustomer;
    let customers = Router.current().data().customers;
    if (!customers) return;

    customers = _.map(customers.fetch(), (customer) => {
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
    let currentCustomer = Router.current().data().currentCustomer;
    return Tasks.findRequestedBy(currentCustomer._id);
  }
});

Template.assistantCustomersDashboard.events({
  "click .new-task-button": function(e, tmpl) {
    let currentCustomer = Router.current().data().currentCustomer;
    let data = {
      customerId: currentCustomer._id
    };
    Modal.show('assistantTaskCreate', data);
  }
});
