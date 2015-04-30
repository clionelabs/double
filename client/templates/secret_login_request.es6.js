Template.secretLoginRequest.events({
  "submit #login-request-form": function (event) {
    event.preventDefault();

    let form = event.target;
    let email = form.email.value;

    Meteor.call('requestLoginAccess', email, function(error, result) {
      if (error) {
        Notifications.error("Failed", "Please double check your input email.");
      } else {
        Notifications.success("Successful", "Please check your inbox for access link");
      }
    });
  }
});


