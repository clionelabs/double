Template.customerHeader.helpers({
  numberOfTasks : function numberOfTasks() {
    return this.tasks ? this.tasks.count() : 0;
  },
  isCalling : function() {
    let thisCustomer = _.extend(Meteor.user(), Customer);
    return thisCustomer.isCalling() ? "on" : "off";
  },
  isCallingShowInvisible : function() {
    let thisCustomer = _.extend(Meteor.user(), Customer);
    return thisCustomer.isCalling() ? "show " : "invisible";
  }
});

Template.customerHeader.events({
  "click .call-me" : function() {
    let thisCustomer = _.extend(Meteor.user(), Customer);
    if (thisCustomer.isCalling()) {
      Customers.cancelCallAssistant(Meteor.user()._id);
    } else {
      Customers.callAssistant(Meteor.user()._id);
    }
  },
  "click .settings" : function() {
    Session.setAuth(SessionKeys.IS_SIDEBAR_VISIBLE, true);
  }
});
