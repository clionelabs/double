Template.assistantInvoiceActualFormTimeBasedItem.onRendered(function() {
  let tmpl = this;
  _.extend(tmpl.data, { isEditable : Invoice.ProtoType.isEditable });
  $('textarea.autogrow').autogrow();
  /*
  tmpl.autorun(function() {
    let isEditing = timeBasedItem.isEditing.get();
    let isEditable= timeBasedItem.isEditable();
    tmpl.$('input').attr('disabled', !isEditing);
    tmpl.$('textarea.updates').toggleClass('hide', !isEditing);
    tmpl.$('div.updates').toggleClass('hide', isEditing);

    tmpl.$('.save').toggleClass('hide', !(isEditing && isEditable));
    tmpl.$('.edit').toggleClass('hide', isEditing && isEditable);
    tmpl.$('.delete').toggleClass('hide', isEditing && isEditable);
  });
  */
});


Template.assistantInvoiceActualFormTimeBasedItem.helpers({
  isEditing() {
    return this.isEditing.get();
  },
  isNotEditing() {
    return !this.isEditing.get();
  }
});

Template.assistantInvoiceActualFormTimeBasedItem.events({
  "click .edit" : function(e, tmpl) {
    let state = this;
    let index = $(tmpl.firstNode).index() - 1;
    state.isEditing.set(true);
  },
  "click .save" : function(e, tmpl) {
    tmpl.$('.loading').removeClass('hide');

    let timeBasedItemWithExtraInfo = this;
    let index = $(tmpl.firstNode).index() - 1;
    let newTimeBasedItem = {
      date : moment(tmpl.$('.date').val()).format('YYYY-MM-DD'),
      title : tmpl.$('.title').val(),
      updates : tmpl.$('.updates').val(),
      totalDuration : moment.duration(tmpl.$('.duration').val()).valueOf()
    };
    timeBasedItemWithExtraInfo.timeBasedItems[index] = newTimeBasedItem;

    let selector = { _id : timeBasedItemWithExtraInfo.invoiceId };
    Invoices.update(selector,
        { $set : { timeBasedItems : timeBasedItemWithExtraInfo.timeBasedItems }},
        function() {
          tmpl.$('.loading').addClass('hide');
          timeBasedItemWithExtraInfo.isEditing.set(false);
        }
    );
    timeBasedItemWithExtraInfo.isEditing.set(false);
  },
  "click .delete" : function(e, tmpl) {
    let index = $(tmpl.firstNode).index() - 1;
  }
});

