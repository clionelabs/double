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
    let from = new ReactiveVar(moment().subtract(7, 'd').valueOf());
    let to = new ReactiveVar(moment().valueOf());
    let invoiceRelated = {
      customer : currentCustomer,
      tasks : Tasks.find({ requestorId : currentCustomer._id }),
      from: from,
      to: to
    };
    Modal.show("invoiceCreate", invoiceRelated);
  }
});
