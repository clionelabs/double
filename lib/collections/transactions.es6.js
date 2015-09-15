Transaction = D.Transaction;
Transactions = D.Transactions;

Transactions.createNew = (invoice) => {
  return Transactions.insert(
      { invoiceId : invoice._id,
        customerId : invoice.customerId,
        amount : invoice.debit(),
        status : Transaction.Status.NOT_SUBMITTED,
        createdAt : moment().valueOf()
      });
};

Transactions.find({ status : Transaction.Status.SETTLED }).observe({
  added(transaction) {
    Invoices.findOne(transaction.invoiceId).charge();
  }
});
Transactions.find({ status : Transaction.Status.FAILED }).observe({
  added(transaction) {
    Invoices.findOne(transaction.invoiceId).fail();
  }
});
Transactions.find({ status : Transaction.Status.VOIDED }).observe({
  added(transaction) {
    Invoices.findOne(transaction.invoiceId).void();
  }
});
