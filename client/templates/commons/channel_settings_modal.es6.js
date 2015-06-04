Template.channelSettingsModal.helpers({
  availableCustomers() {
    let channelId = this._id;
    let data = Router.current().data();
    return data.customers.map((customer) => {
      return _.extend(customer, { channelId: channelId }, User);
    });
  }
});

Template.channelSettingsModal.events({
  "click .assign-none": function() {
    let channelId = this._id;
    D.Channels.unassignChannel(channelId);
    Modal.hide();
  },
  "click .assign-spam": function() {
    let channelId = this._id;
    D.Channels.assignChannelToSpam(channelId);
    Modal.hide();
  }
});

Template.channelSettingsModalAssignCustomer.events({
  "click .assign-customer": function() {
    let customerId = this._id;
    let channelId = this.channelId;
    D.Channels.assignChannelToCustomer(channelId, customerId);
    Modal.hide();
  }
});
