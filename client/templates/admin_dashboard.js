Template.adminDashboard.events({
  "click #new-assistant-button": function() {
    Modal.show('adminCreateAssistant');
  },

  "click #new-customer-button": function() {
    Modal.show('adminCreateCustomer');
  }
});

Template.adminCreateAssistant.events({
  "submit #new-assistant-form": function (event) {
    event.preventDefault();

    var form = event.target;
    var data = {
      email: form.email.value,
      firstname: form.firstname.value,
      lastname: form.lastname.value
    }
    Meteor.call('createAssistant', data, function(error, result) {
      Modal.hide();
    });
  }
});

Template.adminCreateCustomer.events({
  "submit #new-customer-form": function (event) {
    event.preventDefault();

    var form = event.target;
    var data = {
      email: form.email.value,
      firstname: form.firstname.value,
      lastname: form.lastname.value
    }
    Meteor.call('createCustomer', data, function(error, result) {
      Modal.hide();
    });
  }
});
