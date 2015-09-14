Invoice = {};
Invoice.Status = {
  Draft : 'draft',
  Issued : 'issued',
  Charged : 'charged',
  Failed : 'failed',
  Refunded : 'refunded'
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
      {name: 'charge', from: 'issued', to: 'charged'},
      {name: 'void', from: 'issued', to: 'voided'},
      {name: 'fail', from: 'issued', to: 'failed'},
      {name: 'retry', from: 'failed', to: 'issued'},
      {name: 'refund', from: 'charged', to: 'refunded'}
    ],
    callbacks: {
      onenterstate: function(event, from, to) {
        if (from === 'none') return;
        let invoice = this;
        let i = Invoices.update(invoice._id, { $set: { 'status' : to }});
      },
      onissue: function(event, from, to) {
        let invoice = this;
        Transactions.createNew(invoice);
        //TODO auto send
      },
      oncharge: function(event, from, to) {
        let invoice = this;
        Customers.deductCreditMs(invoice.customerId, invoice.roundedInSecondTotalDuration());
        //TODO send to mixpanel
        //TODO good job slack message to #general
      },
      onfail: function(event, from, to) {
        //TODO retry slack message to #general
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
  totalAdjustedDuration() {
    //round up to nearest second
    return _.reduce(this.adjustments, function (memo, adjustment) {
      return memo + adjustment.duration;
    }, 0);
  },
  timePayable() {
    return Math.max(0, ( this.roundedInSecondTotalDuration() - this.credit + this.totalAdjustedDuration() ));
  },
  minutePayable() {
    return this.timePayable() / 1000 / 60;
  },
  timeBasedItemsTotal() {
    return this.minutePayable() * this.effectiveRate;
  },
  oneTimePurchasesTotal() {
    return _.reduce(this.oneTimePurchases, (memo, oneTimePurchase) => {
      return memo + oneTimePurchase.amount;
    }, 0);
  },
  isEditable() {
    return this.isStatic !== undefined ? false : this.status === Invoice.Status.Draft;
  },
  debit() {
    return this.timeBasedItemsTotal() + this.oneTimePurchasesTotal();
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
  oneTimePurchases : [
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
  let items = _.flatten(_.map(tasks, _.partial(_getInvoiceItems, from, to)));
  let adjustments = _.flatten(
                      _.map(tasks, function(task) {
                        return _.map(task.adjustmentsInRange(from, to), function(adjustment) {
                          return _.extend({}, adjustment, { requestTitle : task.title });
                        });
                      }));
  let oneTimePurchases =
      _.flatten(_.map(tasks, function(task) {
        return _.map(task.oneTimePurchasesInRange(from, to), function(otp) {
          otp.request = task.title;
          return otp;
        });
      }));
  let customer = Users.findOneCustomer(userId);
  return _.extend({
    createdAt : moment().valueOf(),
    effectiveRate : customer.hourlyRate(),
    credit : customer.creditMs(),
    status : Invoice.Status.Draft,
    from : from,
    to : to,
    customerId : userId,
    timeBasedItems : items,
    oneTimePurchases : oneTimePurchases,
    adjustments : adjustments
  }, Invoice.Prototype);
};
