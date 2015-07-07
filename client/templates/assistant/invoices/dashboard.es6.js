Template.assistantInvoiceDashboard.helpers({
  getSortedInvoices() {
    let currentInvoice = this.currentInvoice;
    let currentCustomer = this.currentCustomer;
    return _.map(
        _.sortBy(this.invoicesOfCustomer.fetch(), function(invoice) {
            return invoice.createdAt * -1;
          }),
        function(invoice) {
          let additionInfo = {};
          additionInfo.isCurrent = (invoice._id === currentInvoice._id);
          additionInfo.currentCustomerId = currentCustomer._id;
          return _.extend(invoice, additionInfo);
        }
    );
  },
  getCurrentInvoice() {
    return this.currentInvoice;
  }
});
