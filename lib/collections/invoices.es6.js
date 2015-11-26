Invoice = _.extend({}, D.Invoice);

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