
Template.assistantsInvoiceActualForm.helpers({
  showIfEditable() {
    return this.status === Invoice.Status.Draft ? "" : "hide";
  },
  timeBasedItems() {
    let invoiceId = this._id
    let status = this.status;
    return _.map(
        this.timeBasedItems,
        (timeBasedItem, i, timeBasedItems) => {
          return _.extend({},
              timeBasedItem,
              {
                status : status,
                invoiceId : invoiceId,
                isEditing : new ReactiveVar(false),
                timeBasedItems : timeBasedItems
              });
        });
  },
  oneTimePurchases() {
    let status = this.status;
    return _.map(this.oneTimePurchases, (oneTimePurchase) => { return _.extend(oneTimePurchase, { status : status }); });
  }
});
