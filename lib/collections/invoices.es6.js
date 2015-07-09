Invoice = {};
Invoice.ProtoType = {};
Invoice.Status = { Draft : 'draft', Pending : 'pending', Charged : 'charged' };

EmptyInvoice = _.extend({
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
  from = moment(from);
  to = moment(to);
  let dates = [];
  let i = 0;
  let formatter = UI._globalHelpers['formatDate'];
  dates[i] = formatter(from.startOf('day').valueOf());

  while (from.add(1, 'd').isBefore(to)) {
    i += 1;
    dates[i] = formatter(from.startOf('day').valueOf());
  }
  return dates;
};

let _getInvoiceItemPerDay = (date, task) => {

  let from = moment(date).startOf('day').valueOf();
  let to = moment(date).endOf('day').valueOf();

  let timesheets = task.timesheets;
  let statuses = task.statuses;

  let result = {};
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

Invoice.ProtoType.totalDuration = function() {
  return _.reduce(this.timeBasedItems, function(memo, timeBasedItem) {
    return memo + timeBasedItem.totalDuration;
  }, 0);
};

Invoice.ProtoType.timePayable = function() {
  return this.totalDuration() - this.rebate;
};

Invoice.ProtoType.debit = function() {
  return this.timePayable() * this.effectiveRate / 1000 / 60;
}

Invoice.ProtoType.isEditable = function() {
  return this.status === Invoice.Status.Draft;
}
