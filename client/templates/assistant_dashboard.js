Template.assistantDashboard.helpers({
  myCustomers: function() {
    return this.placements.map(function(placement) {
      return Users.findOne(placement.customerId);
    });
  }
});
