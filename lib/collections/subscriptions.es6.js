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
    _ratio(from, to) {
      const subscription = this;
      const plan = subscription.plan();
      from = moment(from).startOf('day').valueOf();
      to = moment(to).endOf('day').valueOf();

      if (plan.cycle.unit === 'never'
            || subscription.endedAt && subscription.endedAt < from
            || subscription.startedAt > to
      ) { return 0; }
      const cycleDuration = plan.getCycleDuration();
      let currentCycleFrom = moment(subscription.nextCycleAt(from));
      let prevCycleFrom = currentCycleFrom.clone().subtract(cycleDuration);
      let ratio = 0;
      while (prevCycleFrom.isBefore(moment(to))) {
        let overlapFrom = _.max([from, prevCycleFrom.valueOf(), subscription.startedAt]);
        let overlapTo = _.min([to, currentCycleFrom.valueOf(), subscription.endedAt || Number.MAX_VALUE]);
        let overlapFraction = (overlapTo - overlapFrom) / (currentCycleFrom - prevCycleFrom);
        ratio += overlapFraction;
        currentCycleFrom.add(cycleDuration);
        prevCycleFrom.add(cycleDuration);
      }

      return ratio;

    },
    creditFromPeriod(from, to) {
      return this._ratio(from, to)* this.plan().freeCreditMs;
    },
    chargeFromPeriod(from, to) {
      return this._ratio(from, to) * this.plan().amount;

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

    },
    chargeAt(from) {
      return _.max([moment(from).startOf('day').valueOf(), moment(this.startedAt).startOf('day').valueOf()]);
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
