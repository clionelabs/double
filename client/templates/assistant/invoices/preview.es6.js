Template.assistantInvoicePreview.helpers({
  isDraft() {
    return this.status === Invoice.Status.Draft;
  }
});

Template.assistantInvoicePreview.events({
  "click .charge" : function() {
    let invoiceId = this._id;
    this.issue();
  },
  "click .generate" : function() {
    Router.go(Router.current().url + "?isStatic=true");
  },
  "click .delete" : function() {
    let customerId = this.customerId;
    Invoices.remove(this._id, function(e) {
      if (!e) {
        Router.go('assistant.customers.invoices', { customerId : customerId });
      } else {
        console.log(e);
      }
    });
  }
});
