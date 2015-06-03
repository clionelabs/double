Template.channelTitle.helpers({
  templateName() {
    let suffix = s(this.category.toLowerCase()).capitalize().value();
    return `channelTitle${suffix}`;
  }
});

Template.channel.events({
  "click .assign-customer": function(event) {
    let customerId = this._id;
    let channelId = this.channelId;
    D.Channels.assignChannelToCustomer(channelId, customerId);
  }
});

Template.channelSlack.helpers({
  availableCustomers() {
    let channelId = this._id;
    let data = Router.current().data();
    return data.customers.map(function(customer) {
      return _.extend(customer, { channelId: channelId }, User);
    });
  }
});
