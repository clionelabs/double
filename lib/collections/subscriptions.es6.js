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
 */
Subscription = {
  ProtoType : {
  },
  createEmpty : (customerId) => {
    return {
      startedAt : 0,
      customerId : customerId,
      planId : 'none'
    }
  }
};


Subscriptions.change = (newPlanId, customerId, cb) => {
  const currentSubscription = Subscriptions.findOne({
    customerId : customerId,
    endedAt: { $exists : false }
  });
  const currentDate = moment().valueOf();
  if (currentSubscription) {
    Subscriptions.update(currentSubscription._id, { $set : { endedAt : currentDate }});
  }
  Subscriptions.insert({ planId : newPlanId, customerId : customerId, startedAt : currentDate }, cb);
};

Subscriptions.getSubscriptionRatio = (userId, from, to) => {
  const subscriptions = Subscriptions.find(
    {
      $and: [
        {customerId: userId},
        {startedAt: {$lt: to}},
        {$or: [{endedAt: {$exists: false}}, {endedAt: {$gte: from}}]}]
    }).fetch();

  let ratios = _.flatten(_.map(subscriptions, function (subscription) {
    let ratiosOfSubscription = [];
    const plan = Plans.findOne(subscription.planId);
    if (plan.cycle === 'month') { //TODO expand to bi-monthly / 3-monthly
      const dayOfMonthToCharge = moment(subscription.startedAt).date();
      const dayOfMonthFrom = moment(from).date();
      const firstCycleFrom = dayOfMonthToCharge - dayOfMonthFrom < 0
        ? moment(from).add(1, 'month').subtract(dayOfMonthFrom - dayOfMonthToCharge, 'day').valueOf()
        : moment(from).add(dayOfMonthToCharge - dayOfMonthFrom, 'day').valueOf();

      if (firstCycleFrom < to) {

        //if there is cycle before
        if (firstCycleFrom !== moment(subscription.startedAt).startOf('day').valueOf()) {
          const fractionFrom =
            (firstCycleFrom - from) / (moment(firstCycleFrom).valueOf() - moment(firstCycleFrom).subtract(1, 'month').valueOf());
          ratiosOfSubscription.push({planId: plan._id, ratio: fractionFrom, date: from});
        }

        // cycle
        for (let i = firstCycleFrom; i < to && i < to; i = moment(i).add(1, 'month').valueOf()) {
          const nextMonth = moment(i).add(1, 'month').valueOf();
          const last = subscription.endedAt || to;
          if (nextMonth <= last) {
            ratiosOfSubscription.push({planId: plan._id, ratio: 1, date: i});
          } else {
            ratiosOfSubscription.push({planId: plan._id, ratio: (last - i) / (nextMonth - i), date: i});
          }
        }
      }
    }
    return ratiosOfSubscription;
  }));
  return ratios;

};