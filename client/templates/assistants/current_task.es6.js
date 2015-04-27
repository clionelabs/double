Template.currentTask._timeoutFn = null;

Template.currentTask.onCreated(function() {
  this.data = _.extend(
      this.data,
      { isCurrent : true });
});

Template.currentTask.onRendered(function() {
  Template.currentTask._timeoutFn = Meteor.setInterval(function() {
    let currentTask = Template.assistantDashboardCustomerTab.getCurrentTask();
    Session.setAuth(SessionKeys.CURRENT_TIME_USED, currentTask.getCurrentSectionDuration());
  }, 1000);

});

Template.currentTask.helpers({
  getTimeUsed : function() {
    return moment.duration(+Session.get(SessionKeys.CURRENT_TIME_USED)).format('hh:mm:ss', { trim : false });
  },
  getCustomerName : function() {
    let currentTask = Template.assistantDashboardCustomerTab.getCurrentTask();
    return Users.findCustomers({ _id : currentTask.requestorId }).fetch()[0].displayName();
  }
});

Template.currentTask.onDestroyed(function(){
  Meteor.clearInterval(Template.currentTask._timeoutFn);
  Template.currentTask._timeoutFn = null;
  Session.clear(SessionKeys.CURRENT_TIME_USED);
});