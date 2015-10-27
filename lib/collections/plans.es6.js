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
    }).fetch(), function(customerDetail) {
      console.log(customerDetail);
      Subscriptions.update(customerDetail._id,
        {
          $set : {
            nextAt : moment(customerDetail.nextAt).add(1, 'month').valueOf()
          },
          $push : {
            rechargedAts : customerDetail.nextAt
          }
        }
      );
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
    getParticipates() {
      return _.pluck(Subscriptions.find({ planId : this._id, endedAt : { $exists : false }}).fetch(), 'customerId');
    }
  }
};
