Invoice = {};
Invoice.Status = {
  Draft : 'draft',
  Issued : 'issued',
  Charged : 'charged',
  Failed : 'failed',
  Voided : 'voided'
};

Invoice.StateMachine = function(invoice) {
  let initialState = 'none';
  if (invoice.status) {
    initialState = invoice.status;
  }
  let stateMachine = StateMachine.create({
    initial: {state: initialState, event: 'init', defer: true },
    error: function(eventName, from, to, args, errorCode, errorMessage) {
      let error = 'event ' + eventName + ' was naughty :- ' + errorMessage;
      console.log(error);
      return error;
    },
    events: [
      {name: 'issue', from: 'draft', to: 'issued' },
      {name: 'transactionSuccess', from: 'issued', to: 'charged'},
      {name: 'transactionFailure', from: 'issued', to: 'failed'},
      {name: 'transactionVoid', from: 'issued', to: 'voided'}
    ],
    callbacks: {
      onenterstate: function(event, from, to) {
        if (from === 'none') return;
        let invoice = this;
        let i = Invoices.update(invoice._id, { $set: { 'status' : to }});
      },
      onissue: function(event, from, to) {
        // auto-charge
        let invoice = this;
        let data = {
          invoiceId: invoice._id,
          customerId: invoice.customerId,
          amount: invoice.debit().toFixed(2)
        };
        D.Events.create('newTransaction', data); // call double.pay to create a transaction
        //TODO send usage report email to clients
      },
      ontransactionSuccess: function(event, from, to) {
        let invoice = this;
        Customers.deductCreditMs(invoice.customerId, invoice.roundedInSecondTotalDuration(), invoice.from, invoice.to);
        //TODO send event to mixpanel
        //TODO send slack notification to double's team
      },
      ontransactionFailure: function(event, from, to) {
        //TODO send slack notification to double's team
      },
      ontransactionVoid: function(event, from, to) {
        //TODO send slack notification to double's team
      }
    }
  });
  _.extend(invoice, stateMachine);
  invoice.init();
};

Invoice.ProtoType = {
  roundedInSecondTotalDuration() {
    //round up to nearest second
    return _.reduce(this.timeBasedItems, function (memo, timeBasedItem) {
      return memo + timeBasedItem.roundedInSecondTotalDuration();
    }, 0);
  },
  timePayable() {
    return Math.max(0, (this.roundedInSecondTotalDuration() - this.credit));
  },
  minutePayable() {
    return this.timePayable() / 1000 / 60;
  },
  timeBasedItemsTotal() {
    return this.minutePayable() * this.effectiveRate;
  },
  otherChargesTotal() {
    return _.reduce(this.otherCharges, (memo, otherCharge) => {
      return memo + otherCharge.amount;
    }, 0);
  },
  isEditable() {
    return this.isStatic !== undefined ? false : this.status === Invoice.Status.Draft;
  },
  otherChargesRevenueTotal() {
    return _.reduce(this.otherCharges, (memo, otherCharge) => {
      return memo + (otherCharge.isOnBehalf ? 0 : otherCharge.amount);
    }, 0);
  },
  revenue() {
    return this.timeBasedItemsTotal() + this.otherChargesRevenueTotal();
  },
  debit() {
    return this.timeBasedItemsTotal() + this.otherChargesTotal();
  }
};

Invoice.TimeBasedItem = {};
Invoice.TimeBasedItem.ProtoType = {
  roundedInSecondTotalDuration() {
    return Math.ceil(this.totalDuration / 1000) * 1000;
  }
};

Invoice.transform = (doc) => {
  doc.timeBasedItems = _.map(doc.timeBasedItems, function(timeBasedItem) {
    return _.extend(timeBasedItem, Invoice.TimeBasedItem.ProtoType);
  });
  var invoice = _.extend(doc, Invoice.ProtoType);
  Invoice.StateMachine(invoice);
  return invoice;
};

EmptyInvoice = Invoice.transform({
  _id : 'none',
  status: Invoice.Status.Issued,
  credit : 0,
  effectiveRate : 4.5,
  createdAt : moment().valueOf(),
  from : moment().subtract(7, 'd').valueOf(),
  to : moment().valueOf(),
  customerId : 'none',
  timeBasedItems : [
    {
      title : 'There is no request',
      date : moment().subtract(6, 'd').startOf('day').format('YYYY-MM-DD'),
      updates : "There is no update",
      duration : 360000
    }
  ],
  otherCharges : [
    {
      request : "This is the request",
      title : "This is a one time purchase",
      charge : {
        currency : "HKD",
        amount : "12.34"
      }
    }
  ]
});

Invoices = new Meteor.Collection('invoices', {
  transform : Invoice.transform
});

InvoicesPermission = {
  insert(userId) {
    return (Users.isAdmin(userId) || Users.isAssistant(userId));
  },
  update(userId, invoice) {
    return (Users.isAdmin(userId) || Users.isAssistant(userId)) && invoice.status === Invoice.Status.Draft;
  },
  remove(userId, invoice) {
    return (Users.isAdmin(userId) || Users.isAssistant(userId)) && invoice.status === Invoice.Status.Draft;
  }
};

Invoices.allow(InvoicesPermission);

Invoices.findLastBilledDate = (selector = {}) => {
  if (typeof selector === 'string' || selector instanceof String) {
    selector = { customerId : selector };
  }
  selector = _.extend({},
      selector,
      { $or : [{ status : Invoice.Status.Issued }, { status : Invoice.Status.Charged }]});
  let latestIssuedInvoice = Invoices.findOne(selector, { sort : { to : -1 }});
  return latestIssuedInvoice ? latestIssuedInvoice.to : null;
};


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

Invoice.convertFromTasks = (from, to, tasks, userId) => {
  from = moment(from).startOf('day').valueOf();
  to = moment(to).endOf('day').valueOf();

  const items = _.flatten(_.map(tasks, _.partial(_getInvoiceItems, from, to)));
  const otherCharges =
      _.flatten(_.map(tasks, function(task) {
        return _.map(task.oneTimePurchasesInRange(from, to), function(otp) {
          otp.request = task.title;
          return otp;
        });
      }));
  const customer = Users.findOneCustomer(userId);
  const rechargedAts = customer.getRechargedAts(from, to);

  _.each(rechargedAts, function(rechargedAt) {
    const plan = Plans.findOne(rechargedAt.planId);
    otherCharges.push({
      date : rechargedAt.chargedAt,
      amount : rechargedAt.amount,
      title : plan.name,
      request : '-',
      isOnBehalf : false,
    });
  });

  const creditFromSubscription = customer.getCreditFromSubscription(from, to);
  return _.extend({
    createdAt : moment().valueOf(),
    effectiveRate : customer.hourlyRate(),
    credit : customer.creditMs() + creditFromSubscription,
    status : Invoice.Status.Draft,
    from : from,
    to : to,
    customerId : userId,
    timeBasedItems : items,
    otherCharges : otherCharges

  }, Invoice.Prototype);
};
