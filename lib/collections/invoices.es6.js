Invoice = {};
Invoice.ProtoType = {};
Invoice.Status = { Draft : 'draft', Issued : 'issued', Charged : 'charged' };

EmptyInvoice = _.extend({
  _id : 'none',
  status: Invoice.Status.Issued,
  rebate : 0,
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
      title : "This is a one time purchase",
      charge : {
        currency : "HKD",
        amount : "12.34"
      }
    }
  ]
}, Invoice.ProtoType);


Invoices = new Meteor.Collection('invoices', {
  transform(doc) {
    doc.timeBasedItems = _.map(doc.timeBasedItems, function(timeBasedItem) {
      return _.extend(timeBasedItem, Invoice.TimeBasedItem.ProtoType);
    });
    return _.extend(doc, Invoice.ProtoType);
  }
});

InvoicesPermission = {
  insert(userId) {
    return (Users.isAdmin(userId) || Users.isAssistant(userId));
  },
  update(userId, invoice) {
    return (Users.isAdmin(userId) || Users.isAssistant(userId)) && invoice.status === Invoice.Status.Draft;
  }
};

Invoices.allow(InvoicesPermission);

Invoices.charge = (invoiceId, cb)=> {
  let selector = { _id : invoiceId };
  return Invoices.update(
      selector,
      { $set : { status : Invoice.Status.Issued }}, cb);
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
  let to = moment(date).endOf('day').valueOf();


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
  let oneTimePurchases = _.flatten(_.map(tasks, function(task) { return task.oneTimePurchasesInRange(from, to)}));
  let customer = Users.findOneCustomer(userId);
  return _.extend({
    createdAt : moment().valueOf(),
    effectiveRate : customer.hourlyRate(),
    rebate : customer.rebateMs(),
    status : Invoice.Status.Draft,
    from : from,
    to : to,
    customerId : userId,
    timeBasedItems : items,
    oneTimePurchases : oneTimePurchases
  }, Invoice.Prototype);
};

Invoice.ProtoType = {
  roundedTotalDurationToSecond() {
    //round up to nearest second
    return _.reduce(this.timeBasedItems, function (memo, timeBasedItem) {
      return memo + timeBasedItem.roundedTotalDurationToSecond();
    }, 0);
  },
  timePayable() {
    return Math.max(0, ( this.roundedTotalDurationToSecond() - this.rebate ));
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

Invoice.OneTimePurchase = {

  update : (oneTimePurchaseId, invoiceId, date, title, amount, cb) => {
    let newOneTimePurchase = {
      _id: oneTimePurchaseId,
      date: date,
      title: title,
      amount: amount
    };
    let oneTimePurchases = Invoices.findOne({ _id : invoiceId }).oneTimePurchases;
    let newOneTimePurchases = _.map(oneTimePurchases, function (oneTimePurchase) {
      if (oneTimePurchase._id === newOneTimePurchase._id) {
        return newOneTimePurchase;
      } else {
        return oneTimePurchase;
      }
    });
    let selector = { _id: invoiceId };
    Invoices.update(selector, { $set: { oneTimePurchases: newOneTimePurchases }}, cb);
  },

  delete : (oneTimePurchaseId, invoiceId, cb) => {
    let oneTimePurchases = Invoices.findOne({ _id : invoiceId }).oneTimePurchases;
    oneTimePurchases =
        _.filter(oneTimePurchases, function (oneTimePurchase) {
          return oneTimePurchaseId !== oneTimePurchase._id;
        });
    let selector = { _id : invoiceId };
    Invoices.update(selector, { $set : { oneTimePurchases : oneTimePurchases }}, cb);
  },

  createEmpty : (invoiceId, cb) => {
    let selector = { _id : invoiceId };
    let newOneTimePurchase = {
      _id : Random.id(),
      title : "",
      amount : 0.0,
      isNew : true
    };
    Invoices.update(selector, { $push : { oneTimePurchases : newOneTimePurchase }}, cb);
  }
};
Invoice.TimeBasedItem = {

  update : (timeBasedItemId, invoiceId, date, title, updates, totalDuration, cb) => {
    let newTimeBasedItem = {
      _id: timeBasedItemId,
      date : date,
      title: title,
      updates: updates,
      totalDuration: totalDuration
    };
    let timeBasedItems = Invoices.findOne({ _id : invoiceId }).timeBasedItems;
    let newTimeBasedItems = _.map(timeBasedItems, function (timeBasedItem) {
      if (timeBasedItem._id === newTimeBasedItem._id) {
        return newTimeBasedItem;
      } else {
        return timeBasedItem;
      }
    });
    let selector = {_id: invoiceId};
    Invoices.update(selector, { $set: { timeBasedItems: newTimeBasedItems }}, cb);
  },

  delete : (timeBasedItemId, invoiceId, cb) => {
    let timeBasedItems = Invoices.findOne({ _id : invoiceId }).timeBasedItems;
    timeBasedItems =
        _.filter(timeBasedItems, function (timeBasedItem) {
          return timeBasedItemId !== timeBasedItem._id;
        });
    let selector = { _id : invoiceId };
    Invoices.update(selector, { $set : { timeBasedItems : timeBasedItems }}, cb);
  },

  createEmpty : (invoiceId, cb) => {
    let selector = { _id : invoiceId };
    let newTimeBasedItem = {
      _id : Random.id(),
      totalDuration : 0,
      date : moment().format('YYYY-MM-DD'),
      isNew : true
    };
    Invoices.update(selector, { $push : { timeBasedItems : newTimeBasedItem }}, cb);
  }
};

Invoice.TimeBasedItem.ProtoType = {
  roundedTotalDurationToSecond() {
    return Math.ceil(this.totalDuration / 1000) * 1000;
  }
};