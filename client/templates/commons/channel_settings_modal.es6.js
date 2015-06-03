Template.channelSettingsModal.helpers({
  availableCustomers() {
    let channelId = this._id;
    let data = Router.current().data();
    return data.customers.map(function(customer) {
      return _.extend(customer, { channelId: channelId }, User);
    });
  }
});

Template.channelSettingsModal.events({
  "click .assign-customer": function(event) {
    let customerId = this._id;
    let channelId = this.channelId;
    D.Channels.assignChannelToCustomer(channelId, customerId);
    Modal.hide();
  },
  "click .assign-none": function(event) {
    let channelId = this._id;
    D.Channels.unassignChannel(channelId);
    Modal.hide();
  },
  "click .assign-spam": function(event) {
    let channelId = this._id;
    D.Channels.assignChannelToSpam(channelId);
    Modal.hide();
  }
});
