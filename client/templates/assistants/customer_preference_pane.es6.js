Template.customerPreferencePane._submitFn = (form, userId) => {
  let message = form.target.message.value;
  Customers.Preference.add(userId, message,
    () => {
      form.target.reset();
    });
};

Template.customerPreferencePane.helpers({
  getPreferences : (user)=> {
    return _.map(user.getPreferences(), (preference) => { return _.extend(preference, { userId : user._id }); });
  }
});

Template.customerPreferencePane.events({
  "submit .add-preference" : function(e) {
    e.preventDefault();
    return Template.customerPreferencePane._submitFn(e, this._id, this.isCurrent);
  },
  "click .remove" : function(e) {
    let pref = this;
    Customers.Preference.delete(pref.userId, pref._id);
  }
});
