let actualFormCommonHelpers = {
  fillHeaderIfEditable() {
    return this.isEditable() ? "tableHeaderFiller" : null;
  },
  showIfEditable() {
    return this.isEditable() ? "" : "hide";
  }
};

Template.assistantsInvoiceActualForm.helpers(_.extend({
  showOneTimePurchases() {
    return (this.oneTimePurchases && this.oneTimePurchases.length) || this.isEditable()
              ? "assistantsInvoiceActualFormOneTimePurchasesTable" : "";
  },
  showTimeBasedItems() {
    return (this.timeBasedItems && this.timeBasedItems.length) || this.isEditable()
        ? "assistantsInvoiceActualFormTimeBasedItemsTable" : "";
  },
  debitedOrDue() {
    return this.isCustomerPaymentMethodAvailable ? 'Debited' : 'Due';
  }
}, actualFormCommonHelpers));

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
  "blur input.credit" : function(e, tmpl) {
    let invoiceId = tmpl.data._id;
    let newCredit = moment.duration(e.currentTarget.value).valueOf();
    Invoices.update({ _id : invoiceId }, { $set : { credit : newCredit }});
  },
  "blur input.effective-rate" : function(e, tmpl) {
    let invoiceId = tmpl.data._id;
    let newEffectiveRate = parseFloat(e.currentTarget.value);
    Invoices.update({ _id : invoiceId }, { $set : { effectiveRate : newEffectiveRate }});
  }
});

Template.assistantsInvoiceActualFormTimeBasedItemsTable.helpers(_.extend({
  timeBasedItems() {
    let invoiceId = this._id;
    let status = this.status;
    let isStatic = this.isStatic;

    let argTimeBasedItems = _.map(
        this.timeBasedItems,
        (timeBasedItem, i, timeBasedItems) => {
          return _.extend({},
              timeBasedItem,
              {
                isEditable : Invoice.ProtoType.isEditable,
                isStatic: isStatic,
                isEditing : new ReactiveVar(false),
                status : status,
                invoiceId : invoiceId
              });
        });
    return _(argTimeBasedItems)
            .chain()
            .sortBy('totalDuration')
            .sortBy('updates')
            .sortBy('date')
            .sortBy('title').value();
  }
}, actualFormCommonHelpers));

Template.assistantsInvoiceActualFormOneTimePurchasesTable.helpers(_.extend({
  oneTimePurchases() {
    let invoiceId = this._id;
    let status = this.status;
    let isStatic = this.isStatic;
    let argOneTimePurchases = _.map(
        this.oneTimePurchases,
          (oneTimePurchase, i, oneTimePurchases) => {
            return _.extend({}, oneTimePurchase,
                {
                  isEditable : Invoice.ProtoType.isEditable,
                  isStatic: isStatic,
                  isEditing : new ReactiveVar(false),
                  invoiceId : invoiceId,
                  oneTimePurchases : oneTimePurchases,
                  status : status
                });
          });
    return _(argOneTimePurchases)
        .chain()
        .sortBy('amount')
        .sortBy('title')
        .sortBy('date').value();
  }
}, actualFormCommonHelpers));