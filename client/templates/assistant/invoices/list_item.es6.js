Template.assistantInvoicesListItem.helpers({
  isSelected() {
    return this.isCurrent ? "selected" : "";
  },
  displayName() {
    let formatter = UI._globalHelpers['formatDate'];
    let fromString = formatter(this.from);
    let toString = formatter(this.to);
    return `From ${fromString} to ${toString}`;
  }
});

Template.assistantInvoicesListItem.events({
  "click .invoice" : function() {
    let params = {};
    params.customerId = this.currentCustomerId;
    params.invoiceId = this._id;
    Router.go('assistant.customers.invoices.selected', params);
  }
});