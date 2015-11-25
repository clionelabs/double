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
    return D.Channels.find({customerId: customer._id}).map(function(channel) {
      return {
        currentCustomer: customer,
        channel: channel
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
  }
});

Template.assistantCustomerConversationChannel.helpers({
  isSelectedClass() {
    let data = Template.currentData();
    let customerId = data.currentCustomer._id;
    let channelId = data.channel._id;
    let selectedChannelId = data.currentCustomer.selectedChannelId;
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
