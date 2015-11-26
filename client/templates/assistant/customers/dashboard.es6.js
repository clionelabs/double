Template.assistantCustomersDashboard.helpers({
  conversationData() {
    let currentCustomer = Template.instance().rCurrentCustomer.get();
    let selectedChannel = Template.instance().rSelectedChannel.get();
    let isShowCompletedTask = Template.instance().isShowCompletedTask;

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
  currentCustomer() {
    return Template.instance().rCurrentCustomer.get();
  },
  getRCurrentCustomer() {
    return Template.instance().rCurrentCustomer;
  },
  getCurrentCustomerId() {
    let currentCustomer = Template.instance().rCurrentCustomer.get();
    return currentCustomer? currentCustomer._id: null;
  },
  getSortedCustomers() {
    let currentCustomer = Template.instance().rCurrentCustomer.get();

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
    const currentCustomer = Template.instance().rCurrentCustomer.get();
    const isShowCompletedTask = Template.instance().isShowCompletedTask;

    let query = (new TasksQueryBuilder())
           .setRequestedBy(currentCustomer._id)
           .setIsCompleted(isShowCompletedTask)
           .setOptions({sort: {title: 1}})
           .getCursor();

    return query;
  },
  isCompletedChecked() {
    const isShowCompletedTask = Template.instance().isShowCompletedTask;
    return isShowCompletedTask ? 'fa-check-square-o' : 'fa-square-o';
  },
  getCompletedTaskToggleQuery() {
    const channel = Template.instance().rSelectedChannel.get();
    const isShowCompletedTask = Template.instance().isShowCompletedTask;
    let data = { isShowCompletedTask: !isShowCompletedTask};

    return channel ? _.extend({ selectedChannel: channel._id }, data) : data;
  }
});

Template.assistantCustomersDashboard.events({
  "click .new-task-button": function(e, tmpl) {
    let currentCustomer = Template.instance().rCurrentCustomer.get();
    let data = {
      customerId: currentCustomer._id
    };
    Modal.show('assistantTaskCreate', data);
  }
});

Template.assistantCustomersDashboard.onCreated(function() {
  this.rCurrentCustomer = new ReactiveVar();
  this.rSelectedChannel = new ReactiveVar();
  this.isShowCompletedTask = false;
});

Template.assistantCustomersDashboard.onRendered(function() {
  let instance = this;
  let subs = Template.assistantCustomersDashboard.subs;

  instance.autorun(function() {
    let data = Template.currentData();
    if (data.currentCustomerId) {
      instance.rCurrentCustomer.set(Users.findOneCustomer(data.currentCustomerId));
      subs.subscribe("customerTasks", data.currentCustomerId);
    } else {
      instance.rCurrentCustomer.set(null);
    }
    if (data.selectedChannelId) {
      instance.rSelectedChannel.set(D.Channels.findOne(data.selectedChannelId));
    } else {
      instance.rSelectedChannel.set(null);
    }
    instance.isShowCompletedTask = data.isShowCompletedTask;
  });

  subs.subscribe("routedChannels");
  // subs.subscribe("tasks", {}, {fields: {requestorId: 1, steps: 1}});
  // subs.subscribe("invoices");
})

Template.assistantCustomersDashboard.subs = new SubsManager();
