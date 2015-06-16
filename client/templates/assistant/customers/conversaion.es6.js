Template.assistantCustomerConversation.onRendered(function() {
  let onDateRangePickerApply = function (customer, start, end, label) {
    let invoiceRelated = {
      customer : customer,
      from : start.valueOf(),
      to : end.valueOf(),
      tasks : Tasks.find({ requestorId : customer._id })
    };
    Modal.show("invoice", invoiceRelated);
  };

  this.$('.export').daterangepicker(
      {
        format: 'YYYY-MM-DD',
        opens: 'right',
        maxDate: moment()
      },
      _.partial(onDateRangePickerApply, this.data)
  );
});

Template.assistantCustomerConversation.events({
  "click .profile" : function() {
    Modal.show('customerEditForm', this);
  },
  "click .remove" : function(e) {
    let pref = this;
    Customers.Preference.delete(pref.userId, pref._id);
  }
});

Template.assistantCustomerConversation.helpers({
  channels() {
    let customer = this;
    return D.Channels.find({customerId: customer._id}).map(function(channel) {
      return {
        customer: customer,
        channel: channel
      }
    });
  },
  selectedChannel() {
    let customer = Session.get(SessionKeys.CURRENT_CUSTOMER);
    let customerId = customer._id;
    let key = SessionKeys.getCustomerSelectedChannelIdKey(customerId);
    let channelId = Session.get(key);
    return channelId? D.Channels.findOne(channelId): null;
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
