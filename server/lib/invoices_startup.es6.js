InvoicesStartup = () => {
  // Listen to transactions events
  D.Events.listen('transactionSuccess', function(data) {
    try {
      if (data.type !== D.Transaction.Type.INVOICE) return false;
      let invoiceId = data.invoiceId;
      Invoices.findOne(invoiceId).transactionSuccess();
      return true;
    } catch (ex) {
      return false;
    }
  });

  D.Events.listen('transactionFailure', function(data) {
    try {
      if (data.type !== D.Transaction.Type.INVOICE) return false;
      let invoiceId = data.invoiceId;
      Invoices.findOne(invoiceId).transactionFailure();
      return true;
    } catch (ex) {
      return false;
    }
  });

  D.Events.listen('transactionVoid', function(data) {
    try {
      if (data.type !== D.Transaction.Type.INVOICE) return false;
      let invoiceId = data.invoiceId;
      Invoices.findOne(invoiceId).transactionVoid();
      return true;
    } catch (ex) {
      return false;
    }
  });
}
