Template.assistantCustomersDashboard.helpers({
  conversationData() {
    let currentCustomer = Template.assistantCustomersDashboard.__helpers.get('currentCustomer')();
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
    return Template.assistantCustomersDashboard.__helpers.get('getRCurrentCustomer')().get();
  },
  getRCurrentCustomer() {
    return Template.instance().rCurrentCustomer;
  },
  getCurrentCustomerId() {
    let currentCustomer = Template.assistantCustomersDashboard.__helpers.get('currentCustomer')();
    return currentCustomer? currentCustomer._id: null;
  },
  getSortedCustomers() {
    let currentCustomer = Template.assistantCustomersDashboard.__helpers.get('currentCustomer')();

    let selector = {};
    if (!Users.isAdmin(Meteor.userId())) {
      let myPlacements = Placements.find({assistantId: Meteor.userId()}).fetch();
      let myCustomerIds = _.pluck(myPlacements, 'customerId');
      selector = {_id: {$in: myCustomerIds}};
    }
    let customers = Users.findCustomers(selector);
    if (!customers) return;

    let last = {};
    D.Channels.find().forEach(function(channel) {
      let timestamp = channel.lastMessageTimestamp();
      if (channel.customerId && timestamp) {
        if (!last[channel.customerId] || last[channel.customerId] < timestamp) {
          last[channel.customerId] = timestamp;
        }
      }
    });

    let list = customers.map(function(customer) {
      return _.extend(customer, {
        lastMessageTimestamp: (last[customer._id]? last[customer._id]: 0),
        isCurrent : (currentCustomer && customer._id === currentCustomer._id)
      });
    });
    return _.sortBy(list, function(customer) { return -1 * customer.lastMessageTimestamp; });
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
      subs.subscribe("customers", {_id: data.currentCustomerId});
      subs.subscribe("customerTasks", data.currentCustomerId);
      subs.subscribe("invoices", {customerId: data.currentCustomerId});
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
})

Template.assistantCustomersDashboard.subs = new SubsManager();
