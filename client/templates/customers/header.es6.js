
Template.customerHeader.helpers({
  numberOfTasks : function numberOfTasks() {
    return this.tasks ? this.tasks.count() : 0;
  },
  IS_CALLING : function() {
    //TODO change to customer.IS_CALLING when integrated
    return Session.get(SessionKeys.IS_CALLING) ? "on": "off";
  },

  isCallingShowInvisible : function() {
    //TODO change to customer.IS_CALLING when integrated
    return Session.get(SessionKeys.IS_CALLING) ? "show " : "invisible";
  }
});

Template.customerHeader.events({
  "click .call-me" : function() {
    //TODO change to customer.IS_CALLING when integrated
    Session.setAuth(SessionKeys.IS_CALLING, !Session.get(SessionKeys.IS_CALLING));

  },
  "click .settings" : function() {
    Session.setAuth(SessionKeys.IS_SIDEBAR_VISIBLE, true);
  }
});


//TODO remove when customer.IS_CALLING is finished
Template.customerHeader.destroyed = function() {
  Session.setAuth(SessionKeys.IS_CALLING, false);
};