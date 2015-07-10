
Template.assistantsInvoiceActualForm.helpers({
  showIfEditable() {
    return this.status === Invoice.Status.Draft ? "" : "hide";
  },
  timeBasedItems() {
    let invoiceId = this._id
    let status = this.status;
    return _.sortBy(_.map(
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
        }), 'title');
  },
  oneTimePurchases() {
    let invoiceId = this._id
    let status = this.status;
    return _.map(
        this.oneTimePurchases,
          (oneTimePurchase, i, oneTimePurchases) => {
            return _.extend({}, oneTimePurchase,
                {
                  isEditing : new ReactiveVar(false),
                  invoiceId : invoiceId,
                  oneTimePurchases : oneTimePurchases,
                  status : status
                });
          });
  }
});

Template.assistantsInvoiceActualForm.events({
  "click .add-time-based-item" : function() {
    let invoice = this;
    let invoiceId = invoice._id;
    Invoice.TimeBasedItem.createEmpty(invoiceId);
  },
  "click .add-one-time-purchase" : function() {
    let invoice = this;
    let invoiceId = invoice._id;
    Invoice.OneTimePurchase.createEmpty(invoiceId);
  }
});
