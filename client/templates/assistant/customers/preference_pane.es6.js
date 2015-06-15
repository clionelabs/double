Template.assistantCustomerPreferencePane.onRendered(function() {
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

Template.assistantCustomerPreferencePane._submitFn = (form, userId) => {
  let message = form.target.message.value;
  Customers.Preference.add(userId, message,
    () => {
      form.target.reset();
    });
};

Template.assistantCustomerPreferencePane.helpers({
  getPreferences : (user)=> {
    return _.map(user.getPreferences(), (preference) => { return _.extend(preference, { userId : user._id }); });
  }
});

Template.assistantCustomerPreferencePane.events({
  "click .profile" : function() {
    Modal.show('customerEditForm', this);
  },
  "submit .add-preference" : function(e) {
    e.preventDefault();
    return Template.assistantCustomerPreferencePane._submitFn(e, this._id, this.isCurrent);
  },
  "click .remove" : function(e) {
    let pref = this;
    Customers.Preference.delete(pref.userId, pref._id);
  }
});
