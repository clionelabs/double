Template.layout.helpers({
  isShownWhenLogin() {
    return Meteor.userId() ? "" : "hide";
  },
  isCustomerSelected() {
    return Router.current().route.getName().indexOf('customers') !== -1 ? "selected" : "";
  },
  isRequestSelected() {
    return Router.current().route.getName().indexOf('tasks') !== -1 ? "selected" : "";
  },
  isIncomingSelected() {
    return Router.current().route.getName().indexOf('unrouted') !== -1 ? "selected" : "";
  },
  connectionStatus() {
    return Meteor.status().status;
  },
  toggleMargin() {
    return Meteor.status().status === 'connected' ? '' : 'status-bar-shown';
  }

});
