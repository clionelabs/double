
Template.customerHeader.helpers({
  numberOfTasks : function numberOfTasks() {
    return this.tasks ? this.tasks.count() : 0;
  },
  isCalling : function() {
    //TODO change to customer.isCalling when integrated
    return Session.get("isCalling") ? "on": "off";
  },

  isCallingShowInvisible : function() {
    //TODO change to customer.isCalling when integrated
    return Session.get("isCalling") ? "show " : "invisible";
  }
});

Template.customerHeader.events({
  "click .call-me" : function() {
    //TODO change to customer.isCalling when integrated
    Session.setAuth("isCalling", !Session.get("isCalling"));

  },
  "click .settings" : function() {
    Session.setAuth(Template.customerDashboard.IS_SIDEBAR_VISIBLE, true);
  }
});


//TODO remove when customer.isCalling is finished
Template.customerHeader.destroyed = function() {
  Session.setAuth("isCalling", false);
};