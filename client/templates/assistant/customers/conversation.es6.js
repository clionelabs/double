Template.assistantCustomerConversation.onRendered(function() {
  $('[data-toggle="tooltip"]').tooltip();
});
Template.assistantCustomerConversation.events({
  "click .invoices" : function() {
    let currentCustomer = this;
    Router.go("assistant.customers.invoices", { customerId : currentCustomer._id });
  },
  "click .profile" : function() {
    let currentCustomer = Template.currentData();
    Modal.show('customerEditForm', currentCustomer);
  },
  "click .show-link-payment" : function() {
    let currentCustomer = Template.currentData();
    Modal.show('customerPaymentLink', currentCustomer);
  },
  "click .cancel-selection": function() {
    let currentCustomer = Template.currentData();
    currentCustomer.selectedMessageIdsVar.set({});
  },
  "click .tag-task": function() {
    let currentCustomer = Template.currentData();
    let messageIds = currentCustomer.selectedMessageIdsVar.get();
    let messageIdList = _.keys(messageIds);
    let taskId = this._id;
    Meteor.call('tagTask', messageIdList, taskId, function(error) {
      if (error) {
        Notifications.error("updated failed", "");
      } else {
        currentCustomer.selectedMessageIdsVar.set({});
      }
    });
  }
});

Template.assistantCustomerConversation.helpers({
  channels() {
    let customer = this;
    return D.Channels.find({customerId: customer._id}).map(function(channel) {
      return {
        currentCustomer: customer,
        channel: channel
      };
    });
  },
  selectedChannel() {
    let customer = Template.currentData();
    let channel = D.Channels.findOne(customer.selectedChannelId);
    if (channel) {
      _.extend(channel, {
        selectedMessageIdsVar: customer.selectedMessageIdsVar
      });
    }
    return channel;
  },
  hasPaymentMethod() {
    return this.hasPaymentMethod();
  },
  isAnyMessageSelected() {
    let customer = Template.currentData();
    if (!customer.selectedMessageIdsVar) return false;
    let selectedMessageIds = customer.selectedMessageIdsVar.get();
    return _.keys(selectedMessageIds).length > 0;
  },
  tasks() {
    let customer = Template.currentData();
    return _.sortBy(Tasks.findRequestedBy(customer._id).fetch(), function(task) {
      return task.createdAt * -1;
    });
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
