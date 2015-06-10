Template.assistantCustomersListItem.onRendered(function() {
  let onDateRangePickerApply = function (customer, start, end, label) {
    let invoiceRelated = {
      customer : customer,
      from : start.valueOf(),
      to : end.valueOf(),
      tasks : Tasks.find({ requestorId : customer._id })
    };
    Modal.show("invoice", invoiceRelated);
  };

  this.$('.export').daterangepicker(
      {
        format: 'YYYY-MM-DD',
        opens: 'right',
        maxDate: moment()
      },
      _.partial(onDateRangePickerApply, this.data)
  );
});

Template.assistantCustomersListItem.events({
  "click .profile" : function() {
    Modal.show('customerEditForm', this);
  },
  "click .selector, click .name" : function(e, tmpl) {
    Router.go('assistant.customers', { _id : tmpl.data._id });
  }
});

Template.assistantCustomersListItem.helpers({
  tasks() {
    return Tasks.find({ requestorId: this._id }, { sort: { title: 1 }});
  },
  animateIfIsCalling() {
    let thisCustomer = _.extend(this, Customer);
    return (thisCustomer.isCalling()) ? "animated infinite wobble" : "";
  },
  isSelected() {
    let currentCustomer = Session.get(SessionKeys.CURRENT_CUSTOMER);
    if (currentCustomer) {
      return _.isEqual(this._id, currentCustomer._id) ? "selected" : "";
    } else {
      return "";
    }
  },
  hasNotRepliedClass() {
    return this.hasNotRepliedConversation()? "not-replied": "";
  }
});


