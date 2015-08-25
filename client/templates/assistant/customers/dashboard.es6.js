Template.assistantCustomersDashboard.helpers({
  conversationData() {
    let selectedChannel = Template.currentData().selectedChannel;
    let currentCustomer = Template.currentData().currentCustomer;
    if (selectedChannel) {
      return _.extend(currentCustomer,
          { selectedChannelId: selectedChannel._id,
            selectedMessageIdsVar: new ReactiveVar({}) });
    } else {
      return currentCustomer;
    }
  },
  getCurrentCustomerId() {
    return Template.instance().currentCustomerId;
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
    return _.sortBy(
        _.filter(Tasks.findRequestedBy(currentCustomer._id).fetch(),
            function(task) {
              return task.completedAt === null;
            }),
        function(task) {
          return task.createdAt * -1;
    });
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

Template.assistantCustomersDashboard.onCreated(function() {
  this.currentCustomerId = new ReactiveVar();
});

Template.assistantCustomersDashboard.onRendered(function() {
  let ui = this;
  ui.autorun(function() {
    ui.currentCustomerId.set(Template.currentData().currentCustomer._id);
  });
})