Invoice = {};
Invoice.ProtoType = {};
Invoice.Status = { Draft : 'draft', Pending : 'pending', Charged : 'charged' };

EmptyInvoice = _.extend({
  _id : 'none',
  status: Invoice.Status.Pending,
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
  update(userId) {
    return (Users.isAdmin(userId) || Users.isAssistant(userId));
  }
};

Invoices.allow(InvoicesPermission);

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

let _getInvoiceItemPerDay = (date, task) => {

  let from = moment(date).startOf('day').valueOf();
  let to = moment(date).endOf('day').valueOf();

  let timesheets = task.timesheets;
  let statuses = task.statuses;

  let result = {};
  result._id = Random.id();
  result.date = date;
  result.title = task.title;
  result.totalDuration = _.reduce(_.keys(timesheets), (memo, userId)=> {
    let totalDurationPerUser = _.reduce(timesheets[userId], (memo, timesheet)=> {
      if (timesheet.isWithin(from, to)) {
        return memo + timesheet.duration();
      } else {
        return memo;
      }
    }, 0);
    return memo + totalDurationPerUser;
  }, 0);
  result.updates = _.reduce(_.keys(statuses), (memo, userId) => {
    let statusesPerUser = _.reduce(statuses[userId], (memo, status)=> {
      if (status.createdAt >= from && status.createdAt < to) {
        return memo + status.message + '  \n';
      } else {
        return memo;
      }
    }, "");
    return memo + statusesPerUser;
  }, "");

  return result;
};

let _getInvoiceItem = (from, to, task) => {
  return _.filter(
      _.map(_slicesToDays(from, to), (date) => {
        return _getInvoiceItemPerDay(date, task);
      }), (result) => {
        return (result.totalDuration !== 0 || result.updates !== '');
      }
  );
};

Invoice.convertFromTasks = (from, to, tasks, userId) => {
  let items = _.flatten(_.map(tasks, _.partial(_getInvoiceItem, from, to)));
  return _.extend({
    createdAt : moment().valueOf(),
    effectiveRate : 4.5,
    rebate : 0,
    status : Invoice.Status.Draft,
    from : from,
    to : to,
    customerId : userId,
    timeBasedItems : items
  }, Invoice.Prototype);
};

Invoice.ProtoType = {
  totalDuration() {
    //round up to nearest second
    return _.reduce(this.timeBasedItems, function (memo, timeBasedItem) {
      return memo + timeBasedItem.totalDurationInSecond();
    }, 0);
  },
  minutePayable() {
    return Math.max(0, ( this.totalDuration() - this.rebate )/ 1000 / 60);
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
    return this.status === Invoice.Status.Draft;
  },
  debit() {
    return this.timeBasedItemsTotal() + this.oneTimePurchasesTotal();
  }
};

Invoice.OneTimePurchase = {

  update : (oneTimePurchaseId, invoiceId, title, amount, cb) => {
    let newOneTimePurchase = {
      _id: oneTimePurchaseId,
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
    let selector = {_id: invoiceId};
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
  totalDurationInSecond() {
    return Math.round(this.totalDuration / 1000) * 1000;
  }
};