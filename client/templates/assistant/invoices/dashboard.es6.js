Template.assistantInvoiceDashboard.helpers({
  getLastBilledDate() {
    let lastBilledDate = Invoices.findLastBilledDate({ customerId : this.currentCustomer._id });
    return lastBilledDate;
  },
  getSortedInvoices() {
    let currentInvoice = this.currentInvoice;
    let currentCustomer = this.currentCustomer;
    return _.map(
        _.sortBy(this.invoicesOfCustomer.fetch(), function(invoice) {
            return invoice.createdAt * -1;
          }),
        function(invoice) {
          let additionInfo = {};
          additionInfo.isCurrent = currentInvoice && (invoice._id === currentInvoice._id);
          additionInfo.currentCustomerId = currentCustomer._id;
          return _.extend(invoice, additionInfo);
        }
    );
  },
  getCurrentInvoice() {
    let currentCustomer = this.currentCustomer;
    return _.extend({}, this.currentInvoice,
        {
          isCustomerPaymentMethodAvailable: currentCustomer.hasPaymentMethod(),
          customerFullName: currentCustomer.displayName(),
          customerFirstName : currentCustomer.firstName(),
          isEditing : new ReactiveVar(false)
        });
  },
  assistantInvoicePreview() {
    return this.currentInvoice ? "assistantInvoicePreview" : null;
  }

});

Template.assistantInvoiceDashboard.events({
  "click .add-invoice" : function() {
    let currentCustomer = this.currentCustomer;
    let invoiceRelated = {
      customer : currentCustomer,
      tasks : Tasks.find({ requestorId : currentCustomer._id })
    };
    Modal.show("invoiceCreate", invoiceRelated);
  }
});
