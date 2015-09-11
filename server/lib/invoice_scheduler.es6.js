InvoiceScheduler = {
  checkSettled: () => {
    let invoicesIssued = Invoices.find({ status : Invoice.Status.Issued }).fetch();
    let gateway = BrainTreeGateway.get();
    _.map(invoicesIssued, function(invoice) {
      gateway.transaction.find(invoice.transactionId, function(err, transaction) {
        if (!err) {
          if (transaction.status === 'settled') {
            invoice.charge();
          } else if (_.indexOf([
                'settlement_declined',
                'failed',
                'gateway_rejected',
                'processor_declined'], transaction.status) !== -1) {
            invoice.fail();
          } else if (transaction.status === 'voided') {
            invoice.void();
          }
        } else {
          console.log(err);
        }
      })
    });
  }
};