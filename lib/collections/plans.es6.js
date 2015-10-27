Plans = new Meteor.Collection('plans', {
  transform(doc) {
    return _.extend({}, Plan.ProtoType, doc);
  }
});

Plans.rechargeMonthly = () => {
  _.each(Plans.find({ cycle : 'month' }).fetch(), function(plan) {
    _.each(Subscriptions.find({
      planId : plan._id,
      nextAt : { $lte : moment().valueOf() },
      endedAt : { $exists : false }
    }).fetch(), function(subscription) {
      Subscriptions.proceedNextMonth(subscription._id);
      Meteor.users.update(subscription.customerId, {
        $inc : { 'profile.creditMs' : plan.freeCreditMs }
      });
    });
  });
};

/**
 *  @params freeCreditMs
 *  @params name
 *  @params cycle
 *  @params amount
 */
Plan = {
  ProtoType : {
  }
};

NoPlan = {
  _id : 'none',
  name : 'No Plan',
  freeCreditMs : 0,
  cycle : 'never',
  amount : 0
};