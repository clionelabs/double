const format = function(d) { return moment(d).format('YYYY-MM-DD'); };

const _slicesToDays = (from, to) => {
  let cur = moment(from);
  to = moment(to);
  let dates = [];
  let i = 0;
  while (cur.isBefore(to)) {
    dates[i++] = format(cur.valueOf());
    cur.add(1, 'd');
  }
  return dates;
};

const _getInvoiceItemsPerDay = (date, task) => {

  let from = moment(date).valueOf();
  let to = moment(date).add(1, 'day').valueOf();

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

const _getInvoiceItems = (from, to, task) => {
  return _.flatten(
    _.map(_slicesToDays(from, to), (date) => {
      return _getInvoiceItemsPerDay(date, task);
    }));
};

const _findCustomersShouldGenerate = (date)=> {
  const customersSignedUpSameDay = _.filter(Users.findCustomers().fetch(), function(customer) {
    const dateOfMonth = moment(date).tz(customer.timezone()).date();
    const currentSubscription = customer.currentSubscription();
    const dateOfCharge = currentSubscription ? currentSubscription.startedAt : customer.createdAt;
    return moment(dateOfCharge).tz(customer.timezone()).date() === dateOfMonth;
  });
  return customersSignedUpSameDay;
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
    const otherCharges =_.filter(
      _.flatten(_.map(tasks, function (task) {
        return _.map(task.oneTimePurchasesInRange(from, to), function (otp) {
          otp.request = task.title;
          otp.amount = otp.totalAmount();
          return otp;
        })
      })),
      function(otp) {
        return _.contains(Invoice.OtherCharge.Status.toIncluded, otp.status);
      });
    const customer = Users.findOneCustomer(userId);
    const rechargedAts = Invoices.Generator.rechargedAts(from, to, userId);

    _.each(rechargedAts, function (rechargedAt) {
      const plan = Plans.findOne(rechargedAt.planId);
      const startDate = moment(rechargedAt.chargedAt).add(1, 'day').valueOf();
      const endDate = moment(rechargedAt.chargedAt).ad(1, 'month').valueOf();
      const dateString = `${format(startDate)} to ${format(endDate)}`;
      otherCharges.push({
        date: rechargedAt.chargedAt,
        amount: rechargedAt.amount,
        title: dateString,
        request: plan.name,
        isOnBehalf: false,
        status : Invoice.OtherCharge.Status.PENDING
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
  },
  generateForUsersDue(date) {
    const generator = this;
    const customersSignedUpSameDay = _findCustomersShouldGenerate(date);

    _.each(customersSignedUpSameDay, function(customer) {
      const from = Invoices.findLastBilledDate(customer._id)
                     ? moment(Invoices.findLastBilledDate(customer._id)).add(1, 'day').valueOf()
                     : moment(customer.createdAt).tz(customer.timezone()).startOf('day').valueOf();
      const to = moment(date).tz(customer.timezone()).subtract(1, 'day').endOf('day').valueOf();
      console.log(`[Cron] Generating ${customer.displayName()}'s invoice from ${format(from)} to ${format(to)}.`);
      const invoice = generator.generate(from, to, customer._id);
      const invoiceId = Invoices.insert(invoice);
      const url = Router.routes['assistant.customers.invoices.selected'].url({
        customerId : customer._id,
        invoiceId : invoiceId
      });
      SlackLog.log('_invoices', {
        text: `
<!channel> Hi human minions,
${customer.displayName()}'s invoice from ${format(from)} to ${format(to)} is generated.
Please inspect NOW!
${url}`,
        username: 'Double A.I. Parts',
        unfurl_links: true,
        icon_emoji: ':robot_face:'
      });
    });
  }
};
