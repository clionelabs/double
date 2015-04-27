
Template.customerHeader.helpers({
  numberOfTasks : function numberOfTasks() {
    return this.tasks ? this.tasks.count() : 0;
  },
  isCalling : function() {
    //TODO change to customer.isCalling when integrated
    return Session.get(SessionKeys.isCalling) ? "on": "off";
  },

  isCallingShowInvisible : function() {
    //TODO change to customer.isCalling when integrated
    return Session.get(SessionKeys.isCalling) ? "show " : "invisible";
  }
});

Template.customerHeader.events({
  "click .call-me" : function() {
    //TODO change to customer.isCalling when integrated
    Session.setAuth(SessionKeys.isCalling, !Session.get(SessionKeys.isCalling));

  },
  "click .settings" : function() {
    Session.setAuth(SessionKeys.isSidebarVisible, true);
  }
});


//TODO remove when customer.isCalling is finished
Template.customerHeader.destroyed = function() {
  Session.setAuth(SessionKeys.isCalling, false);
};