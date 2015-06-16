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
  "submit .add-preference" : function(e) {
    e.preventDefault();
    return Template.assistantCustomerPreferencePane._submitFn(e, this._id, this.isCurrent);
  }
});
