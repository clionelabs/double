let init = false;
Invoices.find({ 'status' : Invoice.Status.Charged }).observe({
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
  const email = customer.emails[1] ? customer.emails[1].address : customer.emails[0].address;
  Email.send({
    from: Email.from,
    to: email,
    subject: 'Double: Your user report is ready',
    text: `Hi ${customer.firstName()}!
Your usage report from ${DateFormatter.toDateShortMonthString(invoice.from)} to ${DateFormatter.toDateShortMonthString(invoice.to)} is ready.
you can access <a href='${externalUrl}/invoices/${invoice._id}?token=${invoice.token.value}'>it</a> in five days after you receive this email.

In case of any questions, please let us know!

Cheers,
Cary &amp; Thomas
`
  });
};

