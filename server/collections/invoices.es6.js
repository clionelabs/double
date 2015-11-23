let init = false;
Invoices.find({ 'status' : Invoice.Status.Voided }).observe({
  add(voidedInvoice) {
    if (!init) return;
    const customer = Users.findOneCustomer(voidedInvoice.customerId);
    SlackLog.log('_invoices', {

      text: `
${customer.displayName()}'s invoice from ${format(voidedInvoice.from)} to ${format(voidedInvoice.to)} has been voided.
`,
      username: 'Double A.I. Parts 2',
      unfurl_links: true,
      icon_emoji: ':robot_face:'
    });

  }
});
Invoices.find({ 'status' : Invoice.Status.Failed}).observe({
  add(failedInvoice) {
    if (!init) return;
    const customer = Users.findOneCustomer(failedInvoice.customerId);
    const url = Router.routes['assistant.customers.invoices.selected'].url({
      customerId : failedInvoice.customerId,
      invoiceId : failedInvoice._id
    });
    SlackLog.log('_invoices', {
      text: `
INSPECTION REQUIRED:
${customer.displayName()}'s invoice from ${format(failedInvoice.from)} to ${format(failedInvoice.to)} has failed for some reason.
Link here: ${url}
`,
      username: 'Double A.I. Parts 2',
      unfurl_links: true,
      icon_emoji: ':robot_face:'
    });

  }
});

Invoices.find({ 'status' : Invoice.Status.Charged , 'token' : { $exists : true }}).observe({
  added(chargedInvoice) {
    if (!init) return;

    const customer = Users.findOneCustomer(chargedInvoice.customerId);
    if (chargedInvoice.revenue()) {
      Invoices.sendEmail(chargedInvoice);
    }
    SlackLog.log('_invoices', {
      text: `
${customer.displayName()}'s invoice from ${format(chargedInvoice.from)} to ${format(chargedInvoice.to)} has been charged and an Email has been sent.
`,
      username: 'Double A.I. Parts 2',
      unfurl_links: true,
      icon_emoji: ':robot_face:'
    });
  }
});
init = true;

Invoices.sendEmail = (invoice) => {
  const customer = Users.findOneCustomer(invoice.customerId);
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
