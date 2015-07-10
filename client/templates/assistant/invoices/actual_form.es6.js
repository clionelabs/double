
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
    let invoiceId = this._id;
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
  },
  "blur input.rebate" : function(e, tmpl) {
    console.log('rebate', this);
    let invoiceId = tmpl.data._id;
    let newRebate = moment.duration(e.currentTarget.value).valueOf();
    Invoices.update({ _id : invoiceId }, { $set : { rebate : newRebate }});
  },
  "blur input.effective-rate" : function(e, tmpl) {
    console.log('effective-rate', this);
    let invoiceId = tmpl.data._id;
    let newEffectiveRate = parseFloat(e.currentTarget.value);
    Invoices.update({ _id : invoiceId }, { $set : { effectiveRate : newEffectiveRate }});
  }
});
