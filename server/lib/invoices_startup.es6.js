InvoicesStartup = () => {
  // Listen to transactions events
  D.Events.listen('transactionSuccess', function(data) {
    try {
      let invoiceId = data.invoiceId;
      if (!invoiceId) return false;
      Invoices.findOne(invoiceId).transactionSuccess();
      return true;
    } catch (ex) {
      return false;
    }
  });

  D.Events.listen('transactionFailure', function(data) {
    try {
      let invoiceId = data.invoiceId;
      if (!invoiceId) return false;
      Invoices.findOne(invoiceId).transactionFailure();
      return true;
    } catch (ex) {
      return false;
    }
  });

  D.Events.listen('transactionVoid', function(data) {
    try {
      let invoiceId = data.invoiceId;
      if (!invoiceId) return false;
      Invoices.findOne(invoiceId).transactionVoid();
      return true;
    } catch (ex) {
      return false;
    }
  });
}
