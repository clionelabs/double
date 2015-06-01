Template.layout.helpers({
  isShownWhenLogin() {
    return Meteor.userId() ? "" : "hide";
  }
});