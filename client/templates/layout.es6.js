Template.layout.helpers({
  isShownWhenLogin() {
    return Meteor.userId() ? "" : "hide";
  },
  isCustomerSelected() {
    return Router.current().route.path(this).indexOf('customers') !== -1 ? "selected" : "";
  },
  isRequestSelected() {
    return Router.current().route.path(this).indexOf('tasks') !== -1 ? "selected" : "";
  },
  isIncomingSelected() {
    return Router.current().route.path(this).indexOf('unrouted') !== -1 ? "selected" : "";
  }

});