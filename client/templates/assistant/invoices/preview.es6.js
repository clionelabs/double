Template.assistantInvoicePreview.events({
  "click .charge" : function() {
    let invoiceId = this._id;
    Invoices.charge(invoiceId);
  },
  "click .generate" : function() {
    Router.go(Router.current().url + "?isStatic=true");
  }
});
