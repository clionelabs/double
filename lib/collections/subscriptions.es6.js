Subscriptions = new Meteor.Collection('subscriptions', {
  transform(doc) {
    return _.extend({}, Subscription.ProtoType, doc);
  }
});

/**
 *
 *  @params _id
 *  @params customerId
 *  @params planId
 *  @params startedAt
 *  @params endedAt
 *  @params nextAt
 */
Subscription = {
  ProtoType : {
  },
  createEmpty = (customerId) => {
    return {
      startedAt : 0,
      nextAt : moment().valueOf(),
      customerId : customerId,
      planId : 'none'
    }
  }
};

Subscriptions.cancel = (planId, customerId, cb) => {
  const subscription = Subscriptions.findOne({
    planId : planId, customerId, endedAt : { $exists : false }
  });
  //TODO: Pro rata charge is not here, the whole period
  Subscriptions.update(subscription._id, {
    $set : {
      endedAt : subscription.nextAt
    }
  }, cb);
};

Subscriptions.change = (planId, customerId, cb) => {
  const subscription = Subscriptions.findOne({
    customerId : customerId, endedAt : { $exists : false }
  }) || Subscription.createEmpty(customerId);
  if (subscription.planId !== NoPlan._id) {
    Subscriptions.cancel(subscription.planId, customerId);
  }
  if (planId !== NoPlan._id) {
    Subscriptions.insert({
      planId: planId,
      customerId: customerId,
      startedAt: subscription.nextAt,
      nextAt: subscription.nextAt,
    }, cb);
  }
};

Subscriptions.proceedNextMonth = (subscriptionId, cb) => {
  const subscription = Subscriptions.findOne(subscriptionId);
  Subscriptions.update(subscription._id,
    {
      $set : {
        nextAt : moment(subscription.nextAt).add(1, 'month').valueOf()
      },
      $push : {
        rechargedAts : subscription.nextAt
      }
    }
  , cb);
};