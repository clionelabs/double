Template.assistantCustomerConversation.events({
  "click .add-invoice" : function() {
    let currentCustomer = Template.currentData();
    let from = new ReactiveVar(moment().subtract(7, 'd').valueOf());
    let to = new ReactiveVar(moment().valueOf());
    let invoiceRelated = {
      customer : currentCustomer,
      tasks : Tasks.find({ requestorId : currentCustomer._id }),
      from: from,
      to: to
    };
    Modal.show("invoiceCreate", invoiceRelated);
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
    let customer = this;
    return customer.payment && customer.payment.isAuthorized;
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
    Router.go('assistant.customers', { _id : customer._id }, { query : 'selectedChannel=' + channel._id });
  },
  "click .set-channel": function(event) {
    event.stopPropagation();
    Modal.show('channelSettingsModal', this.channel);
  }
});
