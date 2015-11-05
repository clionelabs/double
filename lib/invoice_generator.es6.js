let _slicesToDays = (from, to) => {
  let cur = moment(from).startOf('day');
  to = moment(to).endOf('day');
  let dates = [];
  let i = 0;
  let formatter = UI._globalHelpers['formatDate'];
  while (cur.isBefore(to)) {
    dates[i++] = formatter(cur.startOf('day').valueOf());
    cur.add(1, 'd');
  }
  return dates;
};

let _getInvoiceItemsPerDay = (date, task) => {

  let from = moment(date).startOf('day').valueOf();
  let to = moment(date).endOf('day').valueOf() + 1;

  let result = _.reduce(task.steps, function(memo, step) {
    if (step.duration(from, to)) {
      let r = {};
      r._id = Random.id();
      r.date = date;
      r.title = task.title;
      r.taskId = task._id;
      r.totalDuration = step.duration(from, to);
      r.updates = step.text;
      memo.push(r);
    }
    return memo;
  }, []);
  return result;
};

let _getInvoiceItems = (from, to, task) => {
  return _.flatten(
    _.map(_slicesToDays(from, to), (date) => {
      return _getInvoiceItemsPerDay(date, task);
    }));
};

Invoices.Generator = {
  creditFromSubscription : (from, to, userId) => {
    const mySubscriptions = Subscriptions.find({ customerId : userId }).fetch();

    let creditMs = _.reduce(mySubscriptions, function(memo, subscription) {
      return memo + subscription.creditFromPeriod(from, to);
    }, 0);
    return creditMs;
  },
  rechargedAts : (from, to, userId) => {
    let subscriptions = Subscriptions.find({ customerId : userId }).fetch();
    let rechargedAts = [];
    _.each(subscriptions, function(subscription) {
      const plan = subscription.plan();
      const amounts = subscription.chargesFromPeriod(from, to);

      _.each(amounts, function(amount) {
        rechargedAts.push({
          chargedAt: amount.date,
          amount: amount.amount,
          planId: plan._id
        });
      });
    });
    return rechargedAts;
  },
  generate : (from, to, userId) => {

    const tasks = Tasks.find({requestorId: userId}).fetch();
    const items = _.flatten(_.map(tasks, _.partial(_getInvoiceItems, from, to)));
    const otherCharges =
      _.flatten(_.map(tasks, function (task) {
        return _.map(task.oneTimePurchasesInRange(from, to), function (otp) {
          otp.request = task.title;
          return otp;
        });
      }));
    const customer = Users.findOneCustomer(userId);
    const rechargedAts = Invoices.Generator.rechargedAts(from, to, userId);

    _.each(rechargedAts, function (rechargedAt) {
      const plan = Plans.findOne(rechargedAt.planId);
      const startDate = moment(rechargedAt.chargedAt).add(1, 'day').valueOf();
      const endDate = moment(rechargedAt.chargedAt).add(1, 'month').valueOf();
      const dateString = `${DateFormatter.toDateShortMonthString(startDate)} to ${DateFormatter.toDateShortMonthString(endDate)}`;
      otherCharges.push({
        date: rechargedAt.chargedAt,
        amount: rechargedAt.amount,
        title: dateString,
        request: plan.name,
        isOnBehalf: false
      });
    });

    const creditFromSubscription = Invoices.Generator.creditFromSubscription(from, to, userId);
    return _.extend({
      createdAt: moment().valueOf(),
      effectiveRate: customer.hourlyRate(),
      credit: customer.creditMs(),
      creditFromSubscription: creditFromSubscription,
      status: Invoice.Status.Draft,
      from: from,
      to: to,
      customerId: userId,
      timeBasedItems: items,
      otherCharges: otherCharges

    }, Invoice.Prototype);
  }
};
