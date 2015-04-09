Template.customerHeader.helpers({
  numberOfTasks : function numberOfTasks() {
    //TODO integration
    return this.tasks ? this.tasks.length : 0;
  },
  showCallAlertComponent : function() {
    //TODO change to customer.isCalling when integrated
    return Session.get("isCalling") ? "callAlert" : null;
  }
});

Template.customerHeader.events({
  "click .call-me" : function() {
    //TODO change to customer.isCalling when integrated
    Session.set("isCalling", true);
  }
});

//TODO remove when customer.isCalling is finished
Template.customerHeader.destroyed = function() {
  Session.set("isCalling", false);
};