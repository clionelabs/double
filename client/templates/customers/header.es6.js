var _toggleTwoClass = function(bool, onClass, offClass) {

  return bool ? onClass : offClass;
}

Template.customerHeader.helpers({
  numberOfTasks : function numberOfTasks() {
    //TODO integration
    return this.tasks ? this.tasks.length : 0;
  },
  isCalling : function() {
    //TODO change to customer.isCalling when integrated
    return _toggleTwoClass(Session.get("isCalling"), "on", "off");
  },

  isCallingShowInvisible : function() {
    //TODO change to customer.isCalling when integrated
    return _toggleTwoClass(Session.get("isCalling"), "show flash infinite", "invisible");
  }
});

Template.customerHeader.events({
  "click .call-me" : function() {
    //TODO change to customer.isCalling when integrated
    Session.set("isCalling", !Session.get("isCalling"));

  }
});


//TODO remove when customer.isCalling is finished
Template.customerHeader.destroyed = function() {
  Session.set("isCalling", false);
};