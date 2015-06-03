Template.assistantCustomersDashboard.helpers({
  getCurrentCustomer() {
    return _.extend(Session.get(SessionKeys.CURRENT_CUSTOMER), Customer, User);
  },
  getTasksOfSelectedCustomer() {
    let currentCustomer = Template.assistantCustomersDashboard.__helpers.get("getCurrentCustomer")();
    return Tasks.findRequestedBy(currentCustomer._id);
  },
  getCurrentCustomerChannels() {
    let currentCustomer = Template.assistantCustomersDashboard.__helpers.get('getCurrentCustomer')();
    return D.Channels.find({customerId: currentCustomer._id});
  },
  isSelectedClass() {
    return this._id === Session.get(SessionKeys.CURRENT_CUSTOMER_CHANNEL_ID)? "active": "";
  },
  getCurrentCustomerSelectedChannel() {
    let channelId = Session.get(SessionKeys.CURRENT_CUSTOMER_CHANNEL_ID);
    return channelId? D.Channels.findOne(channelId): null;
  }
});

Template.assistantCustomersDashboard.events({
  "click .new-task-button": function() {
    let currentCustomer = Template.assistantCustomersDashboard.__helpers.get('getCurrentCustomer')();
    let data = {
      customerId: currentCustomer._id
    };
    Modal.show('assistantTaskCreate', data);
  },

  "click .select-channel": function() {
    Session.setAuth(SessionKeys.CURRENT_CUSTOMER_CHANNEL_ID, this._id);
  },

  "click .remove-channel": function() {
    let removingChannelId = this._id;
    bootbox.confirm("Are you sure you want to unassign this channel?", function(result) {
      if (result) {
        D.Channels.unassignChannel(removingChannelId);
        let channelId = Session.get(SessionKeys.CURRENT_CUSTOMER_CHANNEL_ID);
        if (channelId === removingChannelId) {
          Session.setAuth(SessionKeys.CURRENT_CUSTOMER_CHANNEL_ID, null);
        }
      }
    });
  }
});
