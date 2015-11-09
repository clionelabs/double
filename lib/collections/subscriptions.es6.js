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
    /**
     * Assume from and to is already take timezone into account
     */
    _ratio(from, to) {
      const subscription = this;
      const plan = subscription.plan();
      from = moment(from).valueOf();
      to = moment(to).valueOf();

      if (plan === Plans.NoPlan
            || subscription.endedAt && subscription.endedAt < from
            || subscription.startedAt > to
      ) { return 0; }
      const cycleDuration = plan.cycleDuration();
      let currentCycleFrom = moment(subscription.nextCycleAt(from));
      let prevCycleFrom = currentCycleFrom.clone().subtract(cycleDuration);
      let ratio = 0;
      while (prevCycleFrom.isBefore(moment(to))) {
        let overlapFrom = _.max([from, prevCycleFrom.valueOf(), subscription.startedAt]);
        let overlapTo = _.min([to, currentCycleFrom.valueOf(), subscription.endedAt + 1|| Number.MAX_VALUE]);
        let overlapFraction = (overlapTo - overlapFrom) / (currentCycleFrom - prevCycleFrom);
        ratio += overlapFraction;
        currentCycleFrom.add(cycleDuration);
        prevCycleFrom.add(cycleDuration);
      }

      return ratio;

    },
    creditFromPeriod(from, to) {
      return Math.ceil(this._ratio(from, to) * this.plan().freeCreditMs / 1000 / 60) * 1000 * 60;
    },
    chargesFromPeriod(from, to) {
      const plan = this.plan();

      let iDate = moment(this.startedAt);
      let charges = [];
      if (plan === Plans.NoPlan) { return charges; }
      const tillMoment = moment(_.min([to, this.endedAt || Number.MAX_VALUE]) + 1);
      const fromMoment = moment(from);
      while(!iDate.isAfter(tillMoment)) {
        let dateOfCharge = iDate.clone().subtract(1, 'day');
        if (!dateOfCharge.isBefore(fromMoment)) {
          charges.push({date: dateOfCharge.valueOf(), amount: plan.amount})
        }
        iDate.add(plan.cycleDuration());
      }
      return charges;
    },
    plan() {
      return Plans.findOne(this.planId);
    },
    nextCycleAt(from=moment().valueOf()) {
      const plan = Plans.findOne(this.planId);
      const currM = moment(this.startedAt);
      const fromM = moment(from);

      while(currM.isBefore(fromM)) {
        currM.add(plan.cycleDuration());
      }

      return currM.valueOf();

    },
    chargeAt(from) {
      return _.max([from, this.startedAt]);
    }
  }
};

Subscriptions.change = (newPlanId, customerId, cb) => {
  const customer = Users.findOneCustomer(customerId);
  const currentSubscription = customer.currentSubscription();
  const currentDate = moment().tz(customer.timezone()).startOf('day').valueOf();
  if (currentSubscription) {
    Subscriptions.update(currentSubscription._id, { $set : { endedAt : currentDate - 1 }});
  }
  Subscriptions.insert({ planId : newPlanId, customerId : customerId, startedAt : currentDate }, cb);
};
