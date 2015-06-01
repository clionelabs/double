Template.customerEditForm.events({
  "submit #customer-form": function (event) {
    event.preventDefault();

    let isEdit = !!this._id;

    let form = event.target;
    let data = {
      firstname: form.firstname.value,
      lastname: form.lastname.value,
      plan : { maxHour : form.maxhour.value }
    };

    if (!isEdit) {
      _.extend(data, { email: form.email.value });
    }

    let cb = function(error, result) {
      Modal.hide();
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
    return this.emails[0].address;
  },
  disabledIfEdit() {
    return this._id ? "disabled" : "";
  }
});
