Template.assistantCustomerConversation.onRendered(function() {
  let template = this;
  template.autorun(function() {

    let customer = Template.currentData();
    if (customer._id === EmptyCustomer._id) return;
    let onDateRangePickerApply = function (customer, start, end, label) {
      let invoiceRelated = {
        customer : customer,
        from : start.valueOf(),
        to : end.valueOf(),
        tasks : Tasks.find({ requestorId : customer._id })
      };
      Modal.show("invoice", invoiceRelated);
    };


    template.$('.export').daterangepicker(
        {
          format: 'YYYY-MM-DD',
          opens: 'right',
          maxDate: moment()
        },
        _.partial(onDateRangePickerApply, customer)
    );
  });
});

Template.assistantCustomerConversation.events({
  "click .profile" : function() {
    let currentCustomer = Template.currentData().currentCustomer;
    Modal.show('customerEditForm', currentCustomer);
  },
  "click .show-link-payment" : function() {
    let currentCustomer = Template.currentData().currentCustomer;
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
    let customer = this;
    if (!customer._id) return null;
    let customerId = customer._id;
    let key = SessionKeys.getCustomerSelectedChannelIdKey(customerId);
    let channelId = Session.get(key);
    return channelId ? D.Channels.findOne(channelId) : null;
  },
  hasNoPaymentMethod() {
    //TODO add check payment method
    return true;
  }
});

Template.assistantCustomerConversationChannel.helpers({
  isSelectedClass() {
    let customerId = this.customer._id;
    let channelId = this.channel._id;
    let key = SessionKeys.getCustomerSelectedChannelIdKey(customerId);
    return channelId === Session.get(key)? "active": "";
  },
  isNotReplied() {
    return this.channel.isNotReplied();
  }
});

Template.assistantCustomerConversationChannel.events({
  "click .select-channel": function() {
    let key = SessionKeys.getCustomerSelectedChannelIdKey(this.customer._id);
    Session.set(key, this.channel._id);
  },
  "click .set-channel": function(event) {
    event.stopPropagation();
    let key = SessionKeys.getCustomerSelectedChannelIdKey(this.customer._id);
    Session.set(key, null);
    Modal.show('channelSettingsModal', this.channel);
  }
});
