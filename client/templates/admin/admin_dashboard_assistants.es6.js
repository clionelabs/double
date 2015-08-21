Template.adminDashboardAssistants.events({
  "click #new-assistant-button": function() {
    Modal.show('adminCreateAssistant');
  }
});

Template.adminCreateAssistant.events({
  "submit #new-assistant-form": function (event) {
    event.preventDefault();

    let form = event.target;
    let data = {
      email: form.email.value,
      firstname: form.firstname.value,
      lastname: form.lastname.value,
      url : '/david.jpg'
    };
    Meteor.call('createAssistant', data, function(error, result) {
      Modal.hide();
    });
  }
});
