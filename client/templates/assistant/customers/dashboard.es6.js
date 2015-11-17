Template.assistantCustomersDashboard.helpers({
  conversationData() {
    let selectedChannel = Template.currentData().selectedChannel;
    let currentCustomer = Template.currentData().currentCustomer;
    let isShowCompletedTask = Template.currentData().isShowCompletedTask;

    let data = {
      currentCustomer: currentCustomer,
      isShowCompletedTask: isShowCompletedTask
    };
    if (selectedChannel) {
      _.extend(data, {
        selectedChannelId: selectedChannel._id,
        selectedMessageIdsVar: new ReactiveVar({})
      });
    }
    return data;
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
            isCurrent : (currentCustomer && customer._id === currentCustomer._id)
          });
    });
    return _.sortBy(customers, function(customer) { return -1 * customer.lastMessageTimestamp; });
  },
  getTasksOfSelectedCustomer() {
    let currentCustomer = Template.currentData().currentCustomer;
    const isShowCompletedTask = Template.currentData().isShowCompletedTask;

    let query = _.extend({}, TasksQueryBuilder)
           .setRequestedBy(currentCustomer._id)
           .setIsCompleted(isShowCompletedTask)
           .setOptions({sort: {title: 1}})
           .getQuery();

    return query;
  },
  isCompletedChecked() {
    const isShowCompletedTask = Template.currentData().isShowCompletedTask;
    return isShowCompletedTask ? 'fa-check-square-o' : 'fa-square-o';
  },
  getCompletedTaskToggleQuery() {
    const channel = Template.currentData().selectedChannel;
    const isShowCompletedTask = Template.currentData().isShowCompletedTask || false;
    let data = { isShowCompletedTask: !isShowCompletedTask};

    return channel ? _.extend({ selectedChannel: channel._id }, data) : data;
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
    if (Template.currentData().currentCustomer) {
      ui.currentCustomerId.set(Template.currentData().currentCustomer._id);
    } else {
      ui.currentCustomerId.set(null);
    }
  });
})
