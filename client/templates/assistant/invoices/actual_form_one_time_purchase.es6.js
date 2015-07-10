Template.assistantInvoiceActualFormOneTimePurchase.onRendered(function() {
  let tmpl = this;
  if (tmpl.data.isNew) {
    tmpl.data.isEditing.set(true);
  }
  _.extend(tmpl.data, { isEditable : Invoice.ProtoType.isEditable });
});


Template.assistantInvoiceActualFormOneTimePurchase.helpers({
  isEditing() {
    return this.isEditing.get();
  },
  isNotEditing() {
    return !this.isEditing.get();
  }
});

Template.assistantInvoiceActualFormOneTimePurchase.events({
  "click .edit" : function(e, tmpl) {
    let state = this;
    state.isEditing.set(true);
  },
  "click .save" : function(e, tmpl) {
    tmpl.$('.loading').removeClass('hide');

    let oneTimePurchaseWithExtraInfo = this;
    Invoice.OneTimePurchase.update(
        oneTimePurchaseWithExtraInfo._id,
        oneTimePurchaseWithExtraInfo.invoiceId,
        tmpl.$('.title').val(),
        parseFloat(tmpl.$('.amount').val()),
        function () {
          tmpl.$('.loading').addClass('hide');
          oneTimePurchaseWithExtraInfo.isEditing.set(false);
        });
  },
  "click .delete" : function(e, tmpl) {
    let oneTimePurchaseWithExtraInfo = this;

    Invoice.OneTimePurchase.delete(
        oneTimePurchaseWithExtraInfo._id,
        oneTimePurchaseWithExtraInfo.invoiceId,
        function() {
          tmpl.$('.loading').addClass('hide');
          oneTimePurchaseWithExtraInfo.isEditing.set(false);
        });
  }
});

