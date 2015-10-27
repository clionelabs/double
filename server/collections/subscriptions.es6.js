Subscriptions.find({ endedAt : false }).observe({
  changed(newSubscription, oldSubscription) {
    if (newSubscription.nextAt !== oldSubscription.nextAt) {
      const plan = Plans.findOne(newSubscription.planId);
      const customer = Users.findOneCustomer(newSubscription.customerId);
      Meteor.users.update(newSubscription.customerId, {
        $inc : { 'profile.creditMs' : newSubscription.freeCreditMs }
      });
    }
  }
});