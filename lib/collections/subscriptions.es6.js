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
  });
  if (subscription) {
    Subscriptions.cancel(subscription.planId, customerId);
  }
  Subscriptions.insert({
    planId : planId,
    customerId : customerId,
    startedAt : subscription.nextAt,
    nextAt : subscription.nextAt,
  }, cb);
};
