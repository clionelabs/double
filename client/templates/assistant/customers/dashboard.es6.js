Template.assistantCustomersDashboard.helpers({
  getCurrentCustomer() {
    return Template.currentData().currentCustomer;
  },
  getSortedCustomers() {
    let currentCustomer = Template.currentData().currentCustomer;

    let selector = {};
    if (!Users.isAdmin(Meteor.userId())) {
      let myPlacements = Placements.find({assistantId: Meteor.userId()}).fetch();
      let myCustomerIds = _.pluck(myPlacements, 'customerId');
      selector = {_id: {$in: myCustomerIds}};
    }
    let customers = Users.findCustomers(selector);
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
    let currentCustomer = Template.currentData().currentCustomer;
    return Tasks.findRequestedBy(currentCustomer._id);
  }
});

Template.assistantCustomersDashboard.events({
  "click .new-task-button": function(e, tmpl) {
    let currentCustomer = Template.currentData().currentCustomer;
    let data = {
      customerId: currentCustomer._id
    };
    Modal.show('assistantTaskCreate', data);
  }
});
