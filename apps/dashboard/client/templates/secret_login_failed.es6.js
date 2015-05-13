Template.secretLoginFailed.events({
  'click #request-button': function() {
    Meteor.call('requestLoginAccessWithOldSecret', this.secret, function(error, result) {
      Notifications.success("", "Please check your email inbox for the new access link.");
    });
  }
});
