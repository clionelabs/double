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
    let newOneTimePurchase = {
      _id : oneTimePurchaseWithExtraInfo._id,
      title : tmpl.$('.title').val(),
      amount : parseFloat(tmpl.$('.amount').val())
    };
    console.log(newOneTimePurchase);
    let newOneTimePurchases = _.map(oneTimePurchaseWithExtraInfo.oneTimePurchases, function(oneTimePurchase) {
      if (oneTimePurchase._id === newOneTimePurchase._id) {
        return newOneTimePurchase;
      } else {
        return oneTimePurchase;
      }
    });

    let selector = { _id : oneTimePurchaseWithExtraInfo.invoiceId };
    Invoices.update(selector,
        { $set : { oneTimePurchases : newOneTimePurchases }},
        function() {
          tmpl.$('.loading').addClass('hide');
          oneTimePurchaseWithExtraInfo.isEditing.set(false);
        }
    );
  },
  "click .delete" : function(e, tmpl) {
    let oneTimePurchaseWithExtraInfo = this;

    oneTimePurchaseWithExtraInfo.oneTimePurchases =
        _.filter(oneTimePurchaseWithExtraInfo.oneTimePurchases, function (oneTimePurchase) {
          return oneTimePurchaseWithExtraInfo._id !== oneTimePurchase._id;
        });

    let selector = { _id : oneTimePurchaseWithExtraInfo.invoiceId };
    Invoices.update(selector,
        { $set : { oneTimePurchases : oneTimePurchaseWithExtraInfo.timeBasedItems }},
        function() {
          tmpl.$('.loading').addClass('hide');
          oneTimePurchaseWithExtraInfo.isEditing.set(false);
        }
    );
  }
});

