Template.assistantCustomerConversation.onRendered(function() {
  $('[data-toggle="tooltip"]').tooltip();
});
Template.assistantCustomerConversation.events({
  "click .invoices" : function() {
    let currentCustomer = Template.currentData().currentCustomer;
    Router.go("assistant.customers.invoices", { customerId : currentCustomer._id });
  },
  "click .profile" : function() {
    let currentCustomer = Template.currentData().currentCustomer;
    Modal.show('customerEditForm', currentCustomer);
  },
  "click .show-link-payment" : function() {
    let currentCustomer = Template.currentData().currentCustomer;
    Modal.show('customerPaymentLink', currentCustomer);
  },
  "click .cancel-selection": function() {
    let currentData = Template.currentData();
    currentData.selectedMessageIdsVar.set({});
  },
  "click .tag-task": function() {
    let currentData = Template.currentData();
    let messageIds = currentData.selectedMessageIdsVar.get();
    let messageIdList = _.keys(messageIds);
    let taskId = this._id;
    Meteor.call('tagTask', messageIdList, taskId, function(error) {
      if (error) {
        Notifications.error("updated failed", "");
      } else {
        currentData.selectedMessageIdsVar.set({});
      }
    });
  }
});

Template.assistantCustomerConversation.helpers({
  channels() {
    let customer = Template.currentData().currentCustomer;
    let selectedChannelId = Template.currentData().selectedChannelId;
    return D.Channels.find({customerId: customer._id}).map(function(channel) {
      return {
        currentCustomer: customer,
        channel: channel,
        selectedChannelId: selectedChannelId
      };
    });
  },
  selectedChannel() {
    let currentData = Template.currentData();
    let customer = Template.currentData().currentCustomer;
    let channel = D.Channels.findOne(currentData.selectedChannelId);
    if (channel) {
      _.extend(channel, {
        selectedMessageIdsVar: currentData.selectedMessageIdsVar
      });
    }
    return channel;
  },
  hasPaymentMethod() {
    let customer = Template.currentData().currentCustomer;
    return customer.hasPaymentMethod();
  },
  isAnyMessageSelected() {
    let currentData = Template.currentData();
    if (!currentData.selectedMessageIdsVar) return false;
    let selectedMessageIds = currentData.selectedMessageIdsVar.get();
    return _.keys(selectedMessageIds).length > 0;
  },
  tasks() {
    let customer = Template.currentData().currentCustomer;
    let isShowCompletedTask = Template.currentData().isShowCompletedTask;

    let query = (new TasksQueryBuilder())
           .setRequestedBy(customer._id)
           .setIsCompleted(isShowCompletedTask)
           .setOptions({sort: {title: 1}})
           .getCursor();

    return query;
  },
  tasksNotBilledTime() {
    const customerId = Template.currentData().currentCustomer._id;
    const lastBillDate = Invoices.findLastBilledDate(customerId) + 1;
    const tasksOfCustomer = Tasks.find({ requestorId : customerId }).fetch();
    return _.reduce(tasksOfCustomer, function(memo, task) {
      return memo + task.totalDuration(lastBillDate);
    }, 0);
  },
  lastTaskCreatedAt() {
    const customerId = Template.currentData().currentCustomer._id;
    const tasksOfCustomer = Tasks.find({ requestorId : customerId }).fetch();
    const lastTask = _.first(_.sortBy(tasksOfCustomer, function(task) { return -1 * task.createdAt; }));
    return lastTask? lastTask.createdAt: null;
  },
  nextBillAt() {
    const customerId = Template.currentData().currentCustomer._id;
    const customer = Users.findOneCustomer(customerId);
    const currentSubscription = customer.currentSubscription();
    if (currentSubscription) {
      return currentSubscription.nextCycleAt(moment().valueOf());
    } else {
      const customerCreatedAtDay = moment(customer.createdAt).date();
      const customerCreatedAtMonth = moment(customer.createdAt).month();
      const currentMonth = moment().month();
      return currentMonth !== customerCreatedAtMonth
          ? moment().date(customerCreatedAtDay - 1).valueOf()
          : moment().add(1, 'month').date(customerCreatedAtDay - 1).valueOf();

    }
  }
});

Template.assistantCustomerConversationChannel.helpers({
  isSelectedClass() {
    let data = Template.currentData();
    let customerId = data.currentCustomer._id;
    let channelId = data.channel._id;
    let selectedChannelId = data.selectedChannelId;
    return channelId === selectedChannelId ? "active": "";
  },
  isNotReplied() {
    return this.channel.isNotReplied();
  },
  getSelectChannelData() {
    let data = Template.currentData();
    return {_id: data.currentCustomer._id};
  },
  getSelectChannelQuery() {
    const channel = Template.currentData().channel;
    const isShowCompletedTask = Template.currentData().isShowCompletedTask || false;
    return { selectedChannel : channel._id , isShowCompletedTask : isShowCompletedTask };
  }
});

Template.assistantCustomerConversationChannel.events({
  "click .set-channel": function(event) {
    event.preventDefault();
    event.stopPropagation();
    Modal.show('channelSettingsModal', this.channel);
    return true;
  }
});
