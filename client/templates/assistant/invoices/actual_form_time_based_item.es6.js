Template.assistantInvoiceActualFormTimeBasedItem.onRendered(function() {
  let tmpl = this;
  if (tmpl.data.isNew) {
    tmpl.data.isEditing.set(true);
  }
  _.extend(tmpl.data, { isEditable : Invoice.ProtoType.isEditable });
  $('textarea.autogrow').autogrow({ onInitialize: true });
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
    state.isEditing.set(true);
  },
  "click .save" : function(e, tmpl) {
    tmpl.$('.loading').removeClass('hide');

    let timeBasedItemWithExtraInfo = this;
    let newTimeBasedItem = {
      _id : timeBasedItemWithExtraInfo._id,
      date : moment(tmpl.$('.date').val()).format('YYYY-MM-DD'),
      title : tmpl.$('.title').val(),
      updates : tmpl.$('.updates').val(),
      totalDuration : moment.duration(tmpl.$('.duration').val()).valueOf()
    };
    let newTimeBasedItems = _.map(timeBasedItemWithExtraInfo.timeBasedItems, function(timeBasedItem) {
      if (timeBasedItem._id === newTimeBasedItem._id) {
        return newTimeBasedItem;
      } else {
        return timeBasedItem;
      }
    });

    let selector = { _id : timeBasedItemWithExtraInfo.invoiceId };
    Invoices.update(selector,
        { $set : { timeBasedItems : newTimeBasedItems }},
        function() {
          tmpl.$('.loading').addClass('hide');
          timeBasedItemWithExtraInfo.isEditing.set(false);
        }
    );
  },
  "click .delete" : function(e, tmpl) {
    let timeBasedItemWithExtraInfo = this;

    this.timeBasedItems =
        _.filter(timeBasedItemWithExtraInfo.timeBasedItems, function (timeBasedItem) {
          return timeBasedItemWithExtraInfo._id !== timeBasedItem._id;
        });

    let selector = { _id : timeBasedItemWithExtraInfo.invoiceId };
    Invoices.update(selector,
        { $set : { timeBasedItems : timeBasedItemWithExtraInfo.timeBasedItems }},
        function() {
          tmpl.$('.loading').addClass('hide');
          timeBasedItemWithExtraInfo.isEditing.set(false);
        }
    );
  }
});

