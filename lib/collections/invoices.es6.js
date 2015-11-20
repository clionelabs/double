Invoice = _.extend({}, D.Invoice);
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
        const msToBeDeduct  = _.max([0, invoice.roundedInSecondTotalDuration() - invoice.creditFromSubscription]);
        Customers.deductCreditMs(invoice.customerId, msToBeDeduct);
        Invoices.generateToken(invoice._id);
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

EmptyInvoice = Invoice.transform({
  _id : 'none',
  status: Invoice.Status.Issued,
  credit : 0,
  effectiveRate : 4.5,
  createdAt : moment().valueOf(),
  from : moment().subtract(7, 'd').valueOf(),
  to : moment().valueOf(),
  customerId : 'none',
  timeBasedItems : [],
  otherCharges : []
});

Invoice.transform = (doc) => {
  doc = D.Invoice.transform(doc);
  Invoice.StateMachine(doc);
  return doc;
};

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

Invoices = new Meteor.Collection('invoices', {
  transform: Invoice.transform
});
Invoices.allow(InvoicesPermission);

Invoices.findLastBilledDate = (selector = {}) => {
  if (typeof selector === 'string' || selector instanceof String) {
    selector = { customerId : selector };
  }
  selector = _.extend({},
      selector,
      { $or : [{ status : Invoice.Status.Issued }, { status : Invoice.Status.Charged }]});
  const latestIssuedInvoice = Invoices.findOne(selector, { sort : { to : -1 }});
  return latestIssuedInvoice ? latestIssuedInvoice.to : null;
};

Invoices.generateToken = (invoiceId) => {
  D.Events.create('generateInvoiceToken', { invoiceId : invoiceId });
};