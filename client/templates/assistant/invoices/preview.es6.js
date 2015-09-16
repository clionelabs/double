
Template.assistantInvoicePreview.helpers({
  isDraft() {
    return this.status === Invoice.Status.Draft;
  }
});

Template.assistantInvoicePreview.events({
  "click .charge" : function() {
    Template.instance().$('.confirm-charge').removeClass('hide');
  },
  'click .confirm-charge .confirm' : function() {
    let invoice = this;
    invoice.issue();
    Template.instance().$('.confirm-charge').addClass('hide');
  },
  'click .confirm-charge .cancel' : function() {
    Template.instance().$('.confirm-charge').addClass('hide');
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
