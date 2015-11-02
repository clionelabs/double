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
    ratios(from, to) {
      let ratiosOFSubscription = [];
      const plan = this.plan();
      if (plan.cycle.unit === 'never') { return []; }
      from = moment(from).startOf('day').valueOf();
      to = moment(to).endOf('day').valueOf();
      const subscription = this;
      let ratiosOfSubscription = [];
      const cycleDuration = plan.getCycleDuration();
      let currentCycleFrom = moment(this.nextCycleAt(from));
      let prevCycleFrom = currentCycleFrom.clone().subtract(cycleDuration);
      while (prevCycleFrom.isBefore(to)) {
        let overlapFrom = _.max([from, prevCycleFrom.valueOf(), subscription.startedAt]);
        let overlapTo = _.min([to, currentCycleFrom.valueOf(), this.endedAt || Number.MAX_VALUE]);
        let overlapFraction = (overlapTo - overlapFrom) / (currentCycleFrom - prevCycleFrom);
        if (overlapFraction > 0) {
          ratiosOfSubscription.push({date: overlapFrom, planId: plan._id, ratio: overlapFraction})
        }
        currentCycleFrom.add(cycleDuration);
        prevCycleFrom.add(cycleDuration);
      }

      return ratiosOfSubscription;
    },
    plan() {
      return Plans.findOne(this.planId);
    },
    nextCycleAt(from=moment().valueOf()) {
      const plan = Plans.findOne(this.planId);
      const curr = moment(this.startedAt).startOf('day');

      while(curr.isBefore(moment(from))) {
        curr.add(plan.getCycleDuration());
      }

      return curr.valueOf();

    }
  }
};

Subscriptions.change = (newPlanId, customerId, cb) => {
  const customer = Users.findOneCustomer(customerId);
  const currentSubscription = customer.currentSubscription();
  const currentDate = moment().startOf('day').valueOf();
  if (currentSubscription) {
    Subscriptions.update(currentSubscription._id, { $set : { endedAt : currentDate - 1 }});
  }
  Subscriptions.insert({ planId : newPlanId, customerId : customerId, startedAt : currentDate }, cb);
};
