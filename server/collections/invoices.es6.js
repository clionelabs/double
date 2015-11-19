let init = false;
Invoices.find({ 'status' : Invoice.Status.Charged , 'token' : { $exists : true }}).observe({
  added(newInvoice) {
    if (!init) return;

    if (newInvoice.revenue()) {
      Invoices.sendEmail(newInvoice);
    }
  }
});
init = true;

Invoices.sendEmail = (invoice) => {
  const customer = Users.findOneCustomer(invoice.customerId);
  const externalUrl = Meteor.settings.externalUrl;
  const email = customer.billingEmail() ? customer.billingEmail() : customer.primaryEmail();
  Email.send({
    from: Email.from,
    to: email,
    subject: 'Double: Your user report is ready',
    text: `Hi ${customer.firstName()}!
Your usage report from ${DateFormatter.toDateShortMonthString(invoice.from)} to ${DateFormatter.toDateShortMonthString(invoice.to)} is ready.
you can access <a href='${invoice.token.url}'>it</a> in five days after you receive this email.

In case of any questions, please let us know!

Cheers,
Cary &amp; Thomas
`
  });
};
