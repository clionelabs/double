
Template.customerHeader.helpers({
  numberOfTasks : function numberOfTasks() {
    //TODO integration
    return this.tasks ? this.tasks.length : 0;
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
    Session.set("isCalling", !Session.get("isCalling"));

  },
  "click .settings" : function() {
    Session.set(Template.customerDashboard.IS_SIDEBAR_VISIBLE, true);
  }
});


//TODO remove when customer.isCalling is finished
Template.customerHeader.destroyed = function() {
  Session.set("isCalling", false);
};