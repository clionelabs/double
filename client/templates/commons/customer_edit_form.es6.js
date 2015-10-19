Template.customerEditForm.events({
  "submit #customer-form": function (event) {
    event.preventDefault();

    let isEdit = !!this._id;

    let form = event.target;
    let data = {
      firstname: form.firstname.value,
      lastname: form.lastname.value,
      hourlyRate : form.hourlyRate.value,
      creditMs : DurationConverter.minutesToMs(form.creditMs.value)
    };

    if (!isEdit) {
      _.extend(data, { email: form.email.value });
    }

    let cb = function(error, result) {
      if (!error) {
        Modal.hide();
      } else {
        Notifications.error(`${error.message}. Please try again.`, '');
      }
    };
    if (isEdit) {
      Meteor.call('editCustomer', this._id, data, cb);
    } else {
      Meteor.call('createCustomer', data, cb);
    }
  }
});

Template.customerEditForm.helpers({
  getEmail() {
    return this.emails ? this.emails[0].address : null;
  },
  disabledIfEdit() {
    return this._id ? "disabled" : "";
  }
});
