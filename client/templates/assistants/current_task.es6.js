Template.currentTask._timeoutFn = null;

Template.currentTask.onCreated(function() {
  this.data = _.extend(
      this.data,
      { isCurrent : true });
});

Template.currentTask.onRendered(function() {
  Template.currentTask._timeoutFn = Meteor.setInterval(function() {
    let currentTask = Template.assistantDashboardCustomerTab.getCurrentTask();
    Session.setAuth(SessionKeys.currentTimeUsed, currentTask.getCurrentSectionDuration());
  }, 1000);

});

Template.currentTask.helpers({
  getTimeUsed : function() {
    return moment.duration(+Session.get(SessionKeys.currentTimeUsed)).format('hh:mm:ss', { trim : false });
  },
  getCustomerName : function() {
    let currentTask = Template.assistantDashboardCustomerTab.getCurrentTask();
    return Users.findCustomers({ _id : currentTask.requestorId }).fetch()[0].displayName();
  }
});

Template.currentTask.onDestroyed(function(){
  Meteor.clearInterval(Template.currentTask._timeoutFn);
  Template.currentTask._timeoutFn = null;
  Session.clear(SessionKeys.currentTimeUsed);
});