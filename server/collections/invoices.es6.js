Invoices.sendEmail = (invoice) => {
  const customer = Users.findOneCustomer(invoice.customerId);
  const email = customer.billingEmail() ? customer.billingEmail() : customer.primaryEmail();
  Email.send({
    from: Email.fromDouble,
    to: email,
    bcc: ['double@double.co'],
    subject: 'Double: Your user report is ready',
    html: `Hi ${customer.firstName()},
Your usage report from ${DateFormatter.toDateShortMonthStringWithTimeZone(invoice.from, customer.timezone())} to ${DateFormatter.toDateShortMonthStringWithTimeZone(invoice.to, customer.timezone())} is ready.
You can access the report from the following links in the next five days.
<a href='${invoice.token.url}'>Invoice URL</a>

Your payment due in this period is ${invoice.revenue()}. This amount will be debited from your credit card on file.

Thank you for your continuous support and we welcome any feedback you may have.

Double
`
  });
};
