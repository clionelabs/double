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
  }
});

Template.assistantCustomerConversation.helpers({
  channels() {
    let customer = this;
    return D.Channels.find({customerId: customer._id}).map(function(channel) {
      return {
        customer: customer,
        channel: channel
      };
    });
  },
  selectedChannel() {
    let customer = Template.currentData();
    return customer.selectedChannelId ? D.Channels.findOne(customer.selectedChannelId) : null;
  },
  hasPaymentMethod() {
    return this.hasPaymentMethod();
  }
});

Template.assistantCustomerConversationChannel.helpers({
  isSelectedClass() {
    let data = Template.currentData();
    let customerId = data.customer._id;
    let channelId = data.channel._id;
    let selectedChannelId = data.customer.selectedChannelId;
    return channelId === selectedChannelId ? "active": "";
  },
  isNotReplied() {
    return this.channel.isNotReplied();
  }
});

Template.assistantCustomerConversationChannel.events({
  "click .select-channel": function() {
    let customer = Template.currentData().customer;
    let channel = Template.currentData().channel;
    Router.go('assistant.customers.selected', { _id : customer._id }, { query : 'selectedChannel=' + channel._id });
  },
  "click .set-channel": function(event) {
    event.stopPropagation();
    Modal.show('channelSettingsModal', this.channel);
  }
});
